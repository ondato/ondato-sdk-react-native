import { it, describe, expect, jest, beforeEach } from '@jest/globals';

jest.mock('fs-extra', () => ({
  ensureDirSync: jest.fn(),
}));

jest.mock('expo/config-plugins', () => ({
  XML: {
    readXMLAsync: jest.fn(),
    writeXMLAsync: jest.fn(),
  },
}));

// Import the real function we want to test.
import { mergeStringsXml } from '../src/androidLocalization';

// Import the mocked modules to control them in tests.
import { XML } from 'expo/config-plugins';
import fs from 'fs-extra';
import path from 'path';

const readXMLAsyncMock = XML.readXMLAsync as jest.MockedFunction<
  typeof XML.readXMLAsync
>;
const writeXMLAsyncMock = XML.writeXMLAsync as jest.MockedFunction<
  typeof XML.writeXMLAsync
>;
type PluginXMLObject = NonNullable<
  Awaited<ReturnType<typeof XML.readXMLAsync>>
>;
type ResourceStringsXML = {
  resources?: {
    string?: Array<{ _: string; $: { name: string } }>;
  };
};

describe('androidLocalization', () => {
  beforeEach(() => {
    // Reset mocks before each test.
    jest.clearAllMocks();
  });

  describe('mergeStringsXml', () => {
    it('should merge new strings and update existing strings correctly', async () => {
      // ARRANGE: Set up mock source and destination XML data.
      const sourceXml = {
        resources: {
          string: [
            { _: 'Custom Ondato App', $: { name: 'app_name' } }, // Update
            { _: 'A New String', $: { name: 'new_string' } }, // Add
          ],
        },
      } as PluginXMLObject;
      // Use a deep clone for the destination to prevent mutation issues in tests.
      const destXml = JSON.parse(
        JSON.stringify({
          resources: {
            string: [
              { _: 'Original App Name', $: { name: 'app_name' } }, // Overwrite this
              { _: 'Keep This String', $: { name: 'other_string' } }, // Preserve this
            ],
          },
        })
      ) as PluginXMLObject;

      readXMLAsyncMock
        .mockResolvedValueOnce(sourceXml)
        .mockResolvedValueOnce(destXml);

      // ACT: Call the function.
      await mergeStringsXml('fake/source.xml', 'fake/dest.xml');

      // ASSERT: Verify that the merged result is correct.
      const writeCall = writeXMLAsyncMock.mock.calls[0];
      expect(writeCall).toBeDefined();
      const writtenXml = (writeCall![0] as { xml: ResourceStringsXML }).xml;
      const writtenStrings = writtenXml.resources?.string ?? [];
      // Use toContainEqual for robust array checking.
      expect(writtenStrings).toContainEqual({
        _: 'Custom Ondato App',
        $: { name: 'app_name' },
      });
      expect(writtenStrings).toContainEqual({
        _: 'Keep This String',
        $: { name: 'other_string' },
      });
      expect(writtenStrings).toContainEqual({
        _: 'A New String',
        $: { name: 'new_string' },
      });
      // Verify the old value is gone.
      expect(writtenStrings).not.toContainEqual({
        _: 'Original App Name',
        $: { name: 'app_name' },
      });
      // Ensure directory creation was not called since dest exists.
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
    });

    it('should create a new strings.xml file if the destination does not exist', async () => {
      // ARRANGE
      const sourceXml = {
        resources: {
          string: [{ _: 'Custom Ondato App', $: { name: 'app_name' } }],
        },
      } as PluginXMLObject;
      readXMLAsyncMock
        .mockResolvedValueOnce(sourceXml)
        .mockRejectedValueOnce(new Error('File not found')); // Simulate destination not existing.

      // ACT
      await mergeStringsXml('fake/source.xml', 'fake/dest/strings.xml');

      // ASSERT
      expect(fs.ensureDirSync).toHaveBeenCalledWith(
        path.dirname('fake/dest/strings.xml')
      );
      expect(XML.writeXMLAsync).toHaveBeenCalledWith({
        path: 'fake/dest/strings.xml',
        xml: expect.objectContaining({
          resources: {
            string: [{ _: 'Custom Ondato App', $: { name: 'app_name' } }],
          },
        }),
      });
    });

    it('should not modify destination if source has no strings', async () => {
      // ARRANGE
      const sourceXml = {
        resources: {},
      } as PluginXMLObject;
      const destXml = JSON.parse(
        JSON.stringify({
          resources: {
            string: [{ _: 'Keep This String', $: { name: 'keep_string' } }],
          },
        })
      );
      readXMLAsyncMock
        .mockResolvedValueOnce(sourceXml)
        .mockResolvedValueOnce(destXml);
      // ACT
      await mergeStringsXml('fake/source.xml', 'fake/dest.xml');
      // ASSERT
      const writeCall = writeXMLAsyncMock.mock.calls[0];
      expect(writeCall).toBeDefined();
      const writtenXml = (writeCall![0] as { xml: ResourceStringsXML }).xml;
      expect(writtenXml.resources?.string ?? []).toEqual([
        { _: 'Keep This String', $: { name: 'keep_string' } },
      ]);
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
    });

    it('should initialize resources and string array if missing in destination', async () => {
      // ARRANGE
      const sourceXml = {
        resources: {
          string: [{ _: 'New String', $: { name: 'new_string' } }],
        },
      } as PluginXMLObject;
      const destXml = {} as PluginXMLObject; // No resources at all
      readXMLAsyncMock
        .mockResolvedValueOnce(sourceXml)
        .mockResolvedValueOnce(destXml);
      // ACT
      await mergeStringsXml('fake/source.xml', 'fake/dest.xml');
      // ASSERT
      const writeCall = writeXMLAsyncMock.mock.calls[0];
      expect(writeCall).toBeDefined();
      const writtenXml = (writeCall![0] as { xml: ResourceStringsXML }).xml;
      expect(writtenXml.resources?.string ?? []).toEqual([
        { _: 'New String', $: { name: 'new_string' } },
      ]);
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
    });

    it('should initialize string array if missing in destination resources', async () => {
      // ARRANGE
      const sourceXml = {
        resources: {
          string: [{ _: 'New String', $: { name: 'new_string' } }],
        },
      } as PluginXMLObject;
      const destXml = { resources: {} } as PluginXMLObject; // Resources exist, but no string array
      readXMLAsyncMock
        .mockResolvedValueOnce(sourceXml)
        .mockResolvedValueOnce(destXml);
      // ACT
      await mergeStringsXml('fake/source.xml', 'fake/dest.xml');
      // ASSERT
      const writeCall = writeXMLAsyncMock.mock.calls[0];
      expect(writeCall).toBeDefined();
      const writtenXml = (writeCall![0] as { xml: ResourceStringsXML }).xml;
      expect(writtenXml.resources?.string ?? []).toEqual([
        { _: 'New String', $: { name: 'new_string' } },
      ]);
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
    });
  });
});
