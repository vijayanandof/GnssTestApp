# 🛰️ Enhanced GNSS Test Application

A comprehensive React Native test application for the [`react-native-gnss-status-checker`](https://www.npmjs.com/package/react-native-gnss-status-checker) library v1.0.2+.

## 🚀 What's New in v1.0.2+

This test app has been completely upgraded to showcase the **major enhancements** in the GNSS library:

### 📊 **Enhanced Satellite Analysis**
- **Detailed Satellite Information**: Individual satellite data with SVID, signal strength, elevation, azimuth
- **15+ Helper Functions**: Filter and analyze satellites by constellation, signal quality, and usage
- **Comprehensive Statistics**: Total, used in fix, ephemeris/almanac status, average C/N0

### 📻 **Research-Based Frequency Mapping**
- **Sean Barbeau's GNSS Research**: Comprehensive frequency mapping across all constellations
- **Dual-Frequency Detection**: Enhanced detection for L2, L5, E5a, E5b, B2a, B3, E6, LEX, S-band
- **Frequency Band Identification**: Automatic identification of specific frequency bands

### 🔬 **Advanced Analysis Features**
- **Constellation Filtering**: GPS, GLONASS, Galileo, BeiDou, NavIC/IRNSS, QZSS separation
- **Signal Quality Analysis**: Filter satellites by C/N0 threshold (e.g., >25 dB-Hz)
- **Performance Metrics**: Fix quality, signal quality, dual-frequency capability assessment

### ⚡ **Real-time Monitoring**
- **React Hooks Integration**: Live updates using the `useGnssStatus` hook pattern
- **Event-Driven Updates**: Real-time satellite and measurement changes via `DeviceEventEmitter`
- **Background Monitoring**: Continuous GNSS status tracking

## 🧪 Testing Modes

The enhanced test app provides **4 comprehensive testing modes**:

### 1. 🧪 **Basic Status Test**
- Traditional GNSS capability check
- Shows supported constellations and carrier frequencies
- Displays first 5 satellites with detailed information
- API level and feature compatibility assessment

### 2. 🔬 **Satellite Analysis**
- **Constellation Breakdown**: Per-constellation satellite counts
- **Signal Analysis**: Total, used in fix, ephemeris/almanac status
- **Quality Assessment**: High-quality satellites (>25 dB-Hz threshold)
- **Performance Indicators**: Fix quality percentage, signal quality metrics

### 3. 📻 **Frequency Analysis**
- **Detected Frequencies**: Real-time frequency identification with band mapping
- **Reference Table**: Complete frequency mapping for all GNSS constellations
- **Capability Assessment**: Dual-frequency support analysis
- **Device Compatibility**: API level and feature support evaluation

### 4. 📡 **Real-time Status**
- **Live Monitoring**: Real-time updates using React hooks
- **Performance Metrics**: Live satellite counts, signal quality, frequencies
- **Event-Driven**: Updates via `DeviceEventEmitter` as shown in npm docs

## 🏗️ Architecture

### **Enhanced Type Definitions**
```typescript
interface SatelliteInfo {
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
```

### **Comprehensive Helper Functions**
- `getSatellitesByConstellation()` - Filter by constellation type
- `getSatellitesUsedInFix()` - Get satellites used in position fix
- `getSatellitesWithGoodSignal()` - Filter by signal strength threshold
- `getSatelliteStatistics()` - Generate comprehensive statistics
- `identifyFrequencyBand()` - Identify specific frequency bands
- `getFrequencyBandInfo()` - Detailed frequency analysis

### **React Hook Integration**
```typescript
const useGnssStatus = () => {
  const [status, setStatus] = useState<GnssStatusResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Real-time monitoring with DeviceEventEmitter
  // Automatic cleanup and error handling
  
  return { status, isListening };
};
```

## 📱 Device Compatibility

| Feature | Min API | Android Version | Support Level |
|---------|---------|-----------------|---------------|
| Basic satellite count | 21 | 5.0 | ✅ Always |
| Signal strength (C/N0) | 24 | 7.0 | ✅ Conditional |
| Carrier frequencies | 26 | 8.0 | ✅ Conditional |
| Enhanced analysis | 24 | 7.0 | ✅ Helper functions |

## 🚀 Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Update Package**:
   ```bash
   npm install react-native-gnss-status-checker@1.0.2
   ```

3. **Build & Run**:
   ```bash
   npx react-native run-android
   ```

## 🔍 Expected Results

### **🌄 Outdoor Testing** (Recommended)
- **Satellites**: 8-25+ visible satellites
- **Constellations**: GPS + GLONASS + Galileo (+ BeiDou, NavIC)
- **Frequencies**: L1 (1575.42 MHz) + others
- **Dual-Frequency**: L5 (1176.45 MHz) on modern devices
- **Signal Quality**: Multiple satellites >25 dB-Hz

### **🏠 Indoor Testing** (Limited)
- **Satellites**: 0-4 satellites (severely limited)
- **Signal Quality**: Poor (usually <20 dB-Hz)
- **Frequency Detection**: May not detect advanced features

## 🛠️ Key Implementation Features

### **📊 Comprehensive Frequency Mapping**
Based on Sean Barbeau's GNSS research, includes all major frequency bands:
- **GPS**: L1, L2, L5
- **GLONASS**: L1, L2 (with frequency ranges)
- **Galileo**: E1, E5a, E5b, E6
- **BeiDou**: B1, B2a, B3
- **NavIC**: L5, S-band
- **QZSS**: L1, L5, LEX

### **🔬 Advanced Analysis Capabilities**
- Individual satellite analysis with detailed metrics
- Constellation-specific filtering and statistics
- Signal quality assessment with configurable thresholds
- Real-time performance monitoring

### **⚡ Modern React Integration**
- Custom React hooks for GNSS monitoring
- Event-driven real-time updates
- Proper cleanup and error handling
- TypeScript support throughout

## 🐛 Troubleshooting

### **❌ No Detailed Satellite Data**
- **Solution**: Requires Android 7.0+ (API 24+)
- **Alternative**: Basic satellite count still works on older devices

### **❌ No Frequency Detection**
- **Solution**: Requires Android 8.0+ (API 26+)
- **Alternative**: Frequency mapping and identification still available

### **❌ Analysis Functions Fail**
- **Solution**: Update to `react-native-gnss-status-checker@1.0.2`
- **Check**: Verify import statements match new API

### **❌ No Satellites Detected**
- **Solution**: Move outdoors with clear sky view
- **Wait**: Allow 2-5 minutes for satellite acquisition
- **Check**: Ensure location permissions are granted

## 📚 References

- **NPM Package**: [react-native-gnss-status-checker](https://www.npmjs.com/package/react-native-gnss-status-checker)
- **Sean Barbeau's Research**: GNSS frequency mapping and dual-frequency detection
- **Android GNSS API**: LocationManager, GnssStatus, GnssMeasurementsEvent

## 🤝 Contributing

This test application demonstrates the comprehensive capabilities of the enhanced GNSS library. Feel free to extend the testing modes or add new analysis features!

## 📄 License

MIT License - Test application for the `react-native-gnss-status-checker` library.

---

**🎯 This enhanced test app showcases the transformation from a basic satellite checker to a comprehensive GNSS analysis toolkit with research-backed frequency detection and real-time monitoring capabilities.** 