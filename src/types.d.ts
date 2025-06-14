declare module 'react-native-gnss-status-checker' {
  // Enhanced Satellite Information Interface
  export interface SatelliteInfo {
    svid: number;                    // Satellite ID
    constellationType: number;       // GPS, GLONASS, etc.
    constellationName: string;       // Human readable
    cn0DbHz?: number;               // Signal strength
    elevation?: number;             // Angle above horizon
    azimuth?: number;               // Compass direction
    hasEphemeris: boolean;          // Orbital data
    hasAlmanac: boolean;            // Satellite almanac
    usedInFix: boolean;             // Used in position calculation
    carrierFrequencyHz?: number;    // Frequency (API 26+)
  }

  // Main Status Result Interface
  export interface GnssStatusResult {
    isGNSSSupported: boolean;           // Whether GNSS is supported and enabled
    isDualFrequencySupported: boolean;  // Whether dual-frequency (L5) is detected
    isNavICSupported: boolean;          // Whether NavIC (IRNSS) is supported
    satellitesVisible: number;          // Number of visible satellites
    satellitesUsedInFix: number;        // Number of satellites used in position fix
    averageSignalToNoiseRatio: number;  // Average signal-to-noise ratio
    supportedConstellations: string[];  // Array of constellation names
    carrierFrequencies: number[];       // Array of detected frequencies (MHz)
    satellites: SatelliteInfo[];        // Array of satellite information
    apiLevel?: number;                  // Android API level
    supportsCn0?: boolean;             // Whether device supports C/N0
    supportsCarrierFreq?: boolean;     // Whether device supports carrier frequencies
  }

  // Frequency Band Information
  export interface FrequencyBandInfo {
    frequency: number;
    constellation: string;
    band: string;
    isDualFrequency: boolean;
  }

  // Constellation types
  export const GnssConstellations: {
    readonly UNKNOWN: 0;
    readonly GPS: 1;
    readonly SBAS: 2;
    readonly GLONASS: 3;
    readonly QZSS: 4;
    readonly BEIDOU: 5;
    readonly GALILEO: 6;
    readonly IRNSS: 7; // NavIC
  };

  // Carrier frequencies (MHz)
  export const CarrierFrequencies: {
    readonly GPS_L1: 1575.42;
    readonly GPS_L2: 1227.6;
    readonly GPS_L5: 1176.45;
    readonly GLONASS_L1: 1602.0;
    readonly GLONASS_L1_MIN: 1598.0625;
    readonly GLONASS_L1_MAX: 1605.375;
    readonly GLONASS_L2_MIN: 1242.9375;
    readonly GLONASS_L2_MAX: 1248.625;
    readonly GALILEO_E1: 1575.42;
    readonly GALILEO_E5a: 1176.45;
    readonly GALILEO_E5b: 1207.14;
    readonly GALILEO_E6: 1278.75;
    readonly BEIDOU_B1: 1561.098;
    readonly BEIDOU_B2a: 1176.45;
    readonly BEIDOU_B3: 1268.52;
    readonly NAVIC_L5: 1176.45;
    readonly NAVIC_S: 2492.028;
    readonly QZSS_L1: 1575.42;
    readonly QZSS_L5: 1176.45;
    readonly QZSS_LEX: 1278.75;
  };

  // Main API Functions
  export function getGNSSStatus(): Promise<GnssStatusResult>;
  export function startListening(): Promise<void>;
  export function stopListening(): Promise<void>;

  // Helper Functions for Satellite Analysis
  export function getSatellitesByConstellation(
    satellites: SatelliteInfo[], 
    constellationType: number
  ): SatelliteInfo[];

  export function getSatellitesUsedInFix(satellites: SatelliteInfo[]): SatelliteInfo[];

  export function getSatellitesWithGoodSignal(
    satellites: SatelliteInfo[], 
    minCn0: number
  ): SatelliteInfo[];

  export function getSatelliteStatistics(satellites: SatelliteInfo[]): {
    total: number;
    usedInFix: number;
    withEphemeris: number;
    withAlmanac: number;
    averageCn0?: number;
    constellationCounts: { [key: string]: number };
  };

  // Frequency Analysis Functions
  export function identifyFrequencyBand(frequencyMHz: number): FrequencyBandInfo;
  export function getFrequencyBandInfo(frequencies: number[]): FrequencyBandInfo[];

  // Legacy compatibility (deprecated but maintained for backward compatibility)
  export interface GNSSStatus extends GnssStatusResult {}

  // Default export
  const GnssStatusChecker: {
    getGNSSStatus: typeof getGNSSStatus;
    startListening: typeof startListening;
    stopListening: typeof stopListening;
    getSatellitesByConstellation: typeof getSatellitesByConstellation;
    getSatellitesUsedInFix: typeof getSatellitesUsedInFix;
    getSatellitesWithGoodSignal: typeof getSatellitesWithGoodSignal;
    getSatelliteStatistics: typeof getSatelliteStatistics;
    identifyFrequencyBand: typeof identifyFrequencyBand;
    getFrequencyBandInfo: typeof getFrequencyBandInfo;
    GnssConstellations: typeof GnssConstellations;
    CarrierFrequencies: typeof CarrierFrequencies;
  };

  export default GnssStatusChecker;
}

declare global {
  interface Window {
    gnssIntervalId?: number;
  }
} 