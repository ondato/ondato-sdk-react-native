const CLIENT_ID = 'idv.demo.api@ondato.com';
const URL = 'https://sandbox-idvapi.ondato.com';
const OAUTH2_URL = 'https://sandbox-id.ondato.com/connect/token';

const EXAMPLE_USER = {
  email: 'john@email.com',
  firstName: 'John',
  middleName: 'Adam',
  lastName: 'Johnson',
  personalCode: '1214148111000',
  phoneNumber: 370624515141,
  dateOfBirth: '1985-01-14',
};

type OAuth2Data = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

type Item = {
  name: string;
  value: string;
};

type Step = {
  order: number;
  setupId: string;
  type: string;
};

type LocalisationSettings = {
  failureRedirectUrl: string;
  language: string;
  pageTitle: string;
  successRedirectUrl: string;
};

type Setup = {
  applicationId: string;
  createdUtc: string;
  id: string;
  modifiedUtc: string;
  versionId: string;
  isDisabled: boolean;
  endScreen: {
    enabled: boolean;
  };
  generalAppSetting: {
    supportEmail: string;
  };
  name: string;
  omnichannel: {
    appStoreEnabled: boolean;
    enabled: boolean;
    onlyMobileEnabled: boolean;
    restrictToSameIpAddress: boolean;
  };
  sessionScreenRecording: {
    enabled: boolean;
  };
  steps: Step[];
  submissionContinuity: {
    enabled: boolean;
    otpDeliverType: string;
  };
  webAppSetting: {
    baseUrl: string;
    defaultLocalisationSetting: {
      consentDeclinedRedirectUrl: string;
      failureRedirectUrl: string;
      language: string;
      pageTitle: string;
      successRedirectUrl: string;
    };
    localisationSettings: LocalisationSettings[];
  };
};

export const getOauth2Data = async (secret: string): Promise<OAuth2Data> => {
  try {
    const response = await fetch(OAUTH2_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: secret,
        search_params: 'idv_api',
      }).toString(),
    });
    if (response.status === 200) {
      const data = (await response.json()) as OAuth2Data;
      return data;
    }

    throw new Error(`Couldn't fetch oauth2 data: ${response}`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const getSetups = async (token: string): Promise<Item[]> => {
  try {
    const response = await fetch(
      `${URL}/v1/identity-verification-setups/filter?limit=100&orderBy=Name&orderDirection=Asc`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    if (response.status === 200) {
      const data: Setup[] = await response.json();

      const setups = data?.map((item) => ({
        name: item.name,
        value: item.id,
      }));

      if (setups) {
        return setups;
      }
    }

    throw new Error(`Couldn't fetch setups: ${response}`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getIdentityVerificationId = async (
  token: string,
  setupId: string
): Promise<string> => {
  try {
    const response = await fetch(`${URL}/v1/identity-verifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration: EXAMPLE_USER,
        setupId: setupId,
      }),
    });

    if (response.status === 201) {
      const data = await response.json();
      if (data?.id) {
        return data.id;
      }
    }

    throw new Error(`Couldn't retrieve identity verification: ${response}`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getId = async (secret: string) => {
  const token = await getOauth2Data(secret);
  const setups = await getSetups(token.access_token);

  let identityVerificationId: string;
  if (setups[0]) {
    identityVerificationId = await getIdentityVerificationId(
      token.access_token,
      setups[0].value
    );
  } else {
    throw new Error('No setups found');
  }

  return identityVerificationId;
};
