class VersionUtils {
  /**
   * Determines if a current version falls within a specified version range
   * @param {string|null} currentVersion - The version to check
   * @param {string|null} minVersion - Minimum version bound (inclusive)
   * @param {string|null} maxVersion - Maximum version bound (inclusive)
   * @returns {boolean} True if version is within range, false otherwise
   */
  static isInVersion(currentVersion, minVersion, maxVersion) {
    // If min/max versions are null or empty, no restrictions
    const minEmpty = !minVersion || minVersion.trim() === '';
    const maxEmpty = !maxVersion || maxVersion.trim() === '';
    
    if (minEmpty && maxEmpty) {
      return true;
    }
    
    // If current version is null/empty but bounds exist, reject
    const currentEmpty = !currentVersion || currentVersion.trim() === '';
    if (currentEmpty) {
      return false;
    }
    
    // Handle only minVersion specified
    if (!minEmpty && maxEmpty) {
      return this.compareVersion(currentVersion, minVersion) >= 0;
    }
    
    // Handle only maxVersion specified
    if (minEmpty && !maxEmpty) {
      return this.compareVersion(maxVersion, currentVersion) >= 0;
    }
    
    // Both bounds specified - check range
    if (!minEmpty && !maxEmpty) {
      return this.compareVersion(currentVersion, minVersion) >= 0 && 
             this.compareVersion(maxVersion, currentVersion) >= 0;
    }
    
    return true;
  }
  
  /**
   * Compares two version strings numerically
   * @param {string} version1 - First version to compare
   * @param {string} version2 - Second version to compare
   * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
   */
  static compareVersion(version1, version2) {
    if (!version1 || !version2) {
      throw new Error('Version strings cannot be null or empty');
    }
    
    const v1Parts = this.versionFormat(version1).split('.');
    const v2Parts = this.versionFormat(version2).split('.');
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const part1 = i < v1Parts.length ? v1Parts[i] : '0';
      const part2 = i < v2Parts.length ? v2Parts[i] : '0';
      
      // Skip wildcard comparisons
      if (part1 === '*' || part2 === '*') {
        continue;
      }
      
      const num1 = parseInt(part1, 10);
      const num2 = parseInt(part2, 10);
      
      // Handle invalid numbers
      if (isNaN(num1) || isNaN(num2)) {
        throw new Error(`Invalid version component: ${part1} or ${part2}`);
      }
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  }
  
  /**
   * Normalizes version strings by removing build metadata
   * @param {string} version - Version string to format
   * @returns {string} Formatted version string
   */
  static versionFormat(version) {
    if (!version) {
      throw new Error('Version string cannot be null or empty');
    }
    
    if (version.includes('-')) {
      return version.split('-')[0];
    }
    
    return version;
  }
  
  /**
   * Validates if a version string has valid format
   * @param {string} version - Version string to validate
   * @returns {boolean} True if version format is valid
   */
  static isValidVersion(version) {
    if (!version || typeof version !== 'string') {
      return false;
    }
    
    try {
      const formatted = this.versionFormat(version);
      const parts = formatted.split('.');
      
      return parts.every(part => {
        return part === '*' || (!isNaN(parseInt(part, 10)) && parseInt(part, 10) >= 0);
      });
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Gets the major version number
   * @param {string} version - Version string
   * @returns {number} Major version number
   */
  static getMajorVersion(version) {
    const parts = this.versionFormat(version).split('.');
    return parseInt(parts[0] || '0', 10);
  }
  
  /**
   * Gets the minor version number
   * @param {string} version - Version string
   * @returns {number} Minor version number
   */
  static getMinorVersion(version) {
    const parts = this.versionFormat(version).split('.');
    return parseInt(parts[1] || '0', 10);
  }
  
  /**
   * Gets the patch version number
   * @param {string} version - Version string
   * @returns {number} Patch version number
   */
  static getPatchVersion(version) {
    const parts = this.versionFormat(version).split('.');
    return parseInt(parts[2] || '0', 10);
  }
}

// Example usage and test cases
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VersionUtils;
}
