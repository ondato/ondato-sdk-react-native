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
import { mergeStringsXml, type XMLObject } from '../src/androidLocalization';

// Import the mocked modules to control them in tests.
import { XML } from 'expo/config-plugins';
import fs from 'fs-extra';
import path from 'path';

describe('androidLocalization', () => {
  beforeEach(() => {
    // Reset mocks before each test.
    jest.clearAllMocks();
  });

  describe('mergeStringsXml', () => {
    it('should merge new strings and update existing strings correctly', async () => {
      // ARRANGE: Set up mock source and destination XML data.
      const sourceXml: XMLObject = {
        resources: {
          string: [
            { _: 'Custom Ondato App', $: { name: 'app_name' } }, // Update
            { _: 'A New String', $: { name: 'new_string' } }, // Add
          ],
        },
      };
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
      );

      (XML.readXMLAsync as jest.Mock)
        .mockResolvedValueOnce(sourceXml)
        .mockResolvedValueOnce(destXml);

      // ACT: Call the function.
      await mergeStringsXml('fake/source.xml', 'fake/dest.xml');

      // ASSERT: Verify that the merged result is correct.
      const writtenXml = (XML.writeXMLAsync as jest.Mock).mock.calls[0][0].xml;
      // Use toContainEqual for robust array checking.
      expect(writtenXml.resources.string).toContainEqual({
        _: 'Custom Ondato App',
        $: { name: 'app_name' },
      });
      expect(writtenXml.resources.string).toContainEqual({
        _: 'Keep This String',
        $: { name: 'other_string' },
      });
      expect(writtenXml.resources.string).toContainEqual({
        _: 'A New String',
        $: { name: 'new_string' },
      });
      // Verify the old value is gone.
      expect(writtenXml.resources.string).not.toContainEqual({
        _: 'Original App Name',
        $: { name: 'app_name' },
      });
      // Ensure directory creation was not called since dest exists.
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
    });

    it('should create a new strings.xml file if the destination does not exist', async () => {
      // ARRANGE
      const sourceXml: XMLObject = {
        resources: {
          string: [{ _: 'Custom Ondato App', $: { name: 'app_name' } }],
        },
      };
      (XML.readXMLAsync as jest.Mock)
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
      const sourceXml: XMLObject = {
        resources: {},
      };
      const destXml = JSON.parse(
        JSON.stringify({
          resources: {
            string: [{ _: 'Keep This String', $: { name: 'keep_string' } }],
          },
        })
      );
      (XML.readXMLAsync as jest.Mock)
        .mockResolvedValueOnce(sourceXml)
        .mockResolvedValueOnce(destXml);
      // ACT
      await mergeStringsXml('fake/source.xml', 'fake/dest.xml');
      // ASSERT
      const writtenXml = (XML.writeXMLAsync as jest.Mock).mock.calls[0][0].xml;
      expect(writtenXml.resources.string).toEqual([
        { _: 'Keep This String', $: { name: 'keep_string' } },
      ]);
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
    });

    it('should initialize resources and string array if missing in destination', async () => {
      // ARRANGE
      const sourceXml: XMLObject = {
        resources: {
          string: [{ _: 'New String', $: { name: 'new_string' } }],
        },
      };
      const destXml = {}; // No resources at all
      (XML.readXMLAsync as jest.Mock)
        .mockResolvedValueOnce(sourceXml)
        .mockResolvedValueOnce(destXml);
      // ACT
      await mergeStringsXml('fake/source.xml', 'fake/dest.xml');
      // ASSERT
      const writtenXml = (XML.writeXMLAsync as jest.Mock).mock.calls[0][0].xml;
      expect(writtenXml.resources.string).toEqual([
        { _: 'New String', $: { name: 'new_string' } },
      ]);
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
    });

    it('should initialize string array if missing in destination resources', async () => {
      // ARRANGE
      const sourceXml: XMLObject = {
        resources: {
          string: [{ _: 'New String', $: { name: 'new_string' } }],
        },
      };
      const destXml = { resources: {} }; // Resources exist, but no string array
      (XML.readXMLAsync as jest.Mock)
        .mockResolvedValueOnce(sourceXml)
        .mockResolvedValueOnce(destXml);
      // ACT
      await mergeStringsXml('fake/source.xml', 'fake/dest.xml');
      // ASSERT
      const writtenXml = (XML.writeXMLAsync as jest.Mock).mock.calls[0][0].xml;
      expect(writtenXml.resources.string).toEqual([
        { _: 'New String', $: { name: 'new_string' } },
      ]);
      expect(fs.ensureDirSync).not.toHaveBeenCalled();
    });
  });
});
