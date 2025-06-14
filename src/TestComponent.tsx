import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, PermissionsAndroid, DeviceEventEmitter } from 'react-native';
import { 
  getGNSSStatus, 
  startListening, 
  stopListening, 
  GnssStatusResult,
  SatelliteInfo,
  getSatellitesByConstellation,
  getSatellitesUsedInFix,
  getSatellitesWithGoodSignal,
  getSatelliteStatistics,
  identifyFrequencyBand,
  getFrequencyBandInfo,
  GnssConstellations,
  CarrierFrequencies
} from 'react-native-gnss-status-checker';

// Custom hook for GNSS status - implementing the example from npm package
const useGnssStatus = () => {
  const [status, setStatus] = useState<GnssStatusResult | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Get initial status
    getGNSSStatus().then(setStatus).catch(console.error);

    // Start real-time monitoring
    const startMonitoring = async () => {
      try {
        await startListening();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start GNSS monitoring:', error);
      }
    };

    startMonitoring();

    // Listen for updates
    const satelliteListener = DeviceEventEmitter.addListener(
      'onSatelliteStatusChanged',
      (data) => {
        setStatus(prev => prev ? { ...prev, ...data } : null);
      }
    );

    const measurementListener = DeviceEventEmitter.addListener(
      'onMeasurementsChanged',
      (data) => {
        setStatus(prev => prev ? { ...prev, ...data } : null);
      }
    );

    // Cleanup
    return () => {
      satelliteListener.remove();
      measurementListener.remove();
      stopListening().finally(() => setIsListening(false));
    };
  }, []);

  return { status, isListening };
};

const QuickGnssTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { status: realtimeStatus, isListening: hookIsListening } = useGnssStatus();

  useEffect(() => {
    checkPermissions();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        setHasPermission(allGranted);
        
        if (!allGranted) {
          setResult(`
❌ LOCATION PERMISSIONS REQUIRED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please grant location permissions in:
Settings > Apps > GnssTestApp > Permissions > Location

Then restart the app.
          `.trim());
        }
      } catch (err) {
        console.warn('Permission check error:', err);
        setHasPermission(false);
      }
    } else {
      setHasPermission(true);
    }
  };

  const testBasicStatus = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permissions Required',
        'Please grant location permissions to test GNSS functionality.',
        [{ text: 'OK', onPress: checkPermissions }]
      );
      return;
    }

    try {
      setResult('Testing...');
      const status = await getGNSSStatus();
      
      // Add a small delay to ensure we get fresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const resultText = `
✅ ENHANCED STATUS TEST RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛰️ GNSS Supported: ${status.isGNSSSupported ? '✅ YES' : '❌ NO'}
📡 Dual-Frequency: ${status.isDualFrequencySupported ? '✅ YES' : '❌ NO'} 
🇮🇳 NavIC Support: ${status.isNavICSupported ? '✅ YES' : '❌ NO'}
🌟 Satellites: ${status.satellitesVisible} visible, ${status.satellitesUsedInFix} in fix
📊 Signal Quality: ${status.averageSignalToNoiseRatio.toFixed(1)} dB-Hz avg
📱 API Level: ${status.apiLevel || 'Unknown'}
🔧 C/N0 Support: ${status.supportsCn0 ? '✅' : '❌'}
📻 Carrier Freq Support: ${status.supportsCarrierFreq ? '✅' : '❌'}

📊 Constellations (${status.supportedConstellations.length}):
${status.supportedConstellations.map((c: string) => `   • ${c}`).join('\n')}

📻 Frequencies (${status.carrierFrequencies.length}):
${status.carrierFrequencies.map((f: number) => `   • ${f.toFixed(2)} MHz`).join('\n')}

🛰️ DETAILED SATELLITE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${status.satellites.length > 0 ? 
  status.satellites.slice(0, 5).map((sat: SatelliteInfo) => 
    `   SVID ${sat.svid} (${sat.constellationName}): ${sat.cn0DbHz ? sat.cn0DbHz.toFixed(1) + ' dB-Hz' : 'No signal'} ${sat.usedInFix ? '✅' : '❌'}`
  ).join('\n') + (status.satellites.length > 5 ? `\n   ... and ${status.satellites.length - 5} more` : '')
  : '   No satellite details available'
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Raw JSON (first 1000 chars):
${JSON.stringify(status, null, 2).substring(0, 1000)}${JSON.stringify(status, null, 2).length > 1000 ? '...' : ''}
      `.trim();
      
      setResult(resultText);
      console.log('Enhanced GNSS Test Result:', status);

      // If no satellites are visible, suggest real-time monitoring
      if (status.satellitesVisible === 0) {
        setTimeout(() => {
          Alert.alert(
            'No Satellites Detected',
            'Try using real-time monitoring mode to acquire satellites. This may take a few minutes.',
            [{ text: 'OK' }]
          );
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorText = `
❌ ERROR OCCURRED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Error: ${errorMessage}

Possible causes:
• Location permissions not granted
• GPS/Location services disabled  
• Module not properly linked
• Testing indoors (move outside)

Try:
1. Enable location services
2. Grant location permissions
3. Move to outdoor area
4. Wait 30-60 seconds
      `.trim();
      
      setResult(errorText);
      console.error('GNSS Test Error:', error);
    }
  };

  const testSatelliteAnalysis = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permissions Required',
        'Please grant location permissions to test GNSS functionality.',
        [{ text: 'OK', onPress: checkPermissions }]
      );
      return;
    }

    try {
      setResult('Analyzing satellites...');
      const status = await getGNSSStatus();
      
      // Use the new helper functions from the npm package
      const gpsSatellites = getSatellitesByConstellation(status.satellites, GnssConstellations.GPS);
      const glonassSatellites = getSatellitesByConstellation(status.satellites, GnssConstellations.GLONASS);
      const galileoSatellites = getSatellitesByConstellation(status.satellites, GnssConstellations.GALILEO);
      const beidouSatellites = getSatellitesByConstellation(status.satellites, GnssConstellations.BEIDOU);
      const navicSatellites = getSatellitesByConstellation(status.satellites, GnssConstellations.IRNSS);
      
      const usedInFix = getSatellitesUsedInFix(status.satellites);
      const goodSignal = getSatellitesWithGoodSignal(status.satellites, 25.0); // 25 dB-Hz threshold
      const stats = getSatelliteStatistics(status.satellites);
      
      // Frequency analysis
      const frequencyBands = getFrequencyBandInfo(status.carrierFrequencies);
      
      const analysisText = `
🔬 COMPREHENSIVE SATELLITE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CONSTELLATION BREAKDOWN:
   • GPS: ${gpsSatellites.length} satellites
   • GLONASS: ${glonassSatellites.length} satellites  
   • Galileo: ${galileoSatellites.length} satellites
   • BeiDou: ${beidouSatellites.length} satellites
   • NavIC: ${navicSatellites.length} satellites

📈 SIGNAL ANALYSIS:
   • Total: ${stats.total} satellites
   • Used in Fix: ${stats.usedInFix} satellites
   • With Ephemeris: ${stats.withEphemeris} satellites
   • With Almanac: ${stats.withAlmanac} satellites
   • Good Signal (>25dB): ${goodSignal.length} satellites
   • Average C/N0: ${stats.averageCn0 ? stats.averageCn0.toFixed(1) + ' dB-Hz' : 'N/A'}

📻 ENHANCED FREQUENCY ANALYSIS:
${frequencyBands.length > 0 ? 
  frequencyBands.map(band => 
    `   • ${band.frequency} MHz: ${band.constellation} ${band.band} ${band.isDualFrequency ? '(Dual-Freq ⭐)' : ''}`
  ).join('\n')
  : '   No frequency data available'
}

🏆 QUALITY SATELLITES (Signal > 25 dB-Hz):
${goodSignal.length > 0 ? 
  goodSignal.slice(0, 10).map(sat => 
    `   SVID ${sat.svid} (${sat.constellationName}): ${sat.cn0DbHz?.toFixed(1)} dB-Hz, El: ${sat.elevation?.toFixed(0)}°`
  ).join('\n') + (goodSignal.length > 10 ? `\n   ... and ${goodSignal.length - 10} more` : '')
  : '   No high-quality satellites found'
}

🎯 KEY PERFORMANCE INDICATORS:
   • Fix Quality: ${stats.usedInFix}/${stats.total} = ${((stats.usedInFix/stats.total)*100).toFixed(1)}%
   • Signal Quality: ${goodSignal.length}/${stats.total} = ${((goodSignal.length/stats.total)*100).toFixed(1)}% good
   • Dual-Frequency: ${frequencyBands.filter(b => b.isDualFrequency).length > 0 ? '✅ Available' : '❌ Not detected'}
   • NavIC Regional: ${navicSatellites.length > 0 ? '✅ Active' : '❌ Not available'}
      `.trim();
      
      setResult(analysisText);
      console.log('Satellite Analysis:', {
        stats,
        frequencyBands,
        constellationBreakdown: {
          GPS: gpsSatellites.length,
          GLONASS: glonassSatellites.length,
          Galileo: galileoSatellites.length,
          BeiDou: beidouSatellites.length,
          NavIC: navicSatellites.length
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult(`❌ Analysis Error: ${errorMessage}`);
    }
  };

  const testFrequencyAnalysis = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permissions Required',
        'Please grant location permissions to test GNSS functionality.',
        [{ text: 'OK', onPress: checkPermissions }]
      );
      return;
    }

    try {
      setResult('Analyzing frequencies...');
      const status = await getGNSSStatus();
      
      // Test frequency identification for known frequencies
      const knownFrequencies = [
        CarrierFrequencies.GPS_L1,
        CarrierFrequencies.GPS_L5,
        CarrierFrequencies.GALILEO_E5a,
        CarrierFrequencies.BEIDOU_B2a,
        CarrierFrequencies.NAVIC_L5
      ];
      
      const frequencyText = `
📻 COMPREHENSIVE FREQUENCY ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 DETECTED FREQUENCIES:
${status.carrierFrequencies.length > 0 ? 
  status.carrierFrequencies.map(freq => {
    const bandInfo = identifyFrequencyBand(freq);
    return `   • ${freq.toFixed(2)} MHz → ${bandInfo.constellation} ${bandInfo.band} ${bandInfo.isDualFrequency ? '⭐ DUAL-FREQ' : ''}`;
  }).join('\n')
  : '   No carrier frequencies detected'
}

📡 REFERENCE FREQUENCY TABLE:
   • GPS L1: ${CarrierFrequencies.GPS_L1} MHz (Primary)
   • GPS L2: ${CarrierFrequencies.GPS_L2} MHz (Dual-Freq)
   • GPS L5: ${CarrierFrequencies.GPS_L5} MHz (Dual-Freq)
   • Galileo E1: ${CarrierFrequencies.GALILEO_E1} MHz (Primary)
   • Galileo E5a: ${CarrierFrequencies.GALILEO_E5a} MHz (Dual-Freq)
   • Galileo E5b: ${CarrierFrequencies.GALILEO_E5b} MHz (Dual-Freq)
   • BeiDou B1: ${CarrierFrequencies.BEIDOU_B1} MHz (Primary)
   • BeiDou B2a: ${CarrierFrequencies.BEIDOU_B2a} MHz (Dual-Freq)
   • NavIC L5: ${CarrierFrequencies.NAVIC_L5} MHz (Dual-Freq)
   • NavIC S: ${CarrierFrequencies.NAVIC_S} MHz (Dual-Freq)

🎯 FREQUENCY CAPABILITY ASSESSMENT:
   • Total Bands Detected: ${status.carrierFrequencies.length}
   • Dual-Frequency Capable: ${status.isDualFrequencySupported ? '✅ YES' : '❌ NO'}
   • Primary Bands: ${status.carrierFrequencies.filter(f => !identifyFrequencyBand(f).isDualFrequency).length}
   • Dual-Freq Bands: ${status.carrierFrequencies.filter(f => identifyFrequencyBand(f).isDualFrequency).length}

💡 DEVICE COMPATIBILITY:
   • API Level: ${status.apiLevel} ${status.apiLevel && status.apiLevel >= 26 ? '✅ Supports carrier frequency detection' : '⚠️ Limited frequency support'}
   • C/N0 Support: ${status.supportsCn0 ? '✅ Available' : '❌ Not supported'}
   • Advanced Features: ${status.supportsCarrierFreq ? '✅ Full support' : '⚠️ Basic support only'}
      `.trim();
      
      setResult(frequencyText);
      
      // Log detailed frequency analysis
      console.log('Frequency Analysis:', {
        detectedFrequencies: status.carrierFrequencies,
        frequencyBands: getFrequencyBandInfo(status.carrierFrequencies),
        dualFrequencySupport: status.isDualFrequencySupported,
        deviceCapabilities: {
          apiLevel: status.apiLevel,
          supportsCn0: status.supportsCn0,
          supportsCarrierFreq: status.supportsCarrierFreq
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult(`❌ Frequency Analysis Error: ${errorMessage}`);
    }
  };

  const showRealtimeStatus = () => {
    if (!realtimeStatus) {
      setResult('📡 Real-time monitoring is starting...\nPlease wait for data to be collected.');
      return;
    }

    const realtimeText = `
📡 REAL-TIME MONITORING STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Monitoring Active: ${hookIsListening ? '✅ YES' : '❌ NO'}
🛰️ Live Satellites: ${realtimeStatus.satellitesVisible} visible, ${realtimeStatus.satellitesUsedInFix} in fix
📊 Live Signal: ${realtimeStatus.averageSignalToNoiseRatio.toFixed(1)} dB-Hz avg
📻 Live Frequencies: ${realtimeStatus.carrierFrequencies.length} detected

📈 LIVE CONSTELLATION STATUS:
${realtimeStatus.supportedConstellations.map(c => `   • ${c}: Active`).join('\n')}

💡 This data updates automatically from the React hook implementation
shown in the npm package documentation.

🎯 PERFORMANCE METRICS:
   • Update Rate: Real-time via DeviceEventEmitter
   • Data Freshness: Live from GNSS chipset
   • Hook Status: ${hookIsListening ? 'Connected' : 'Disconnected'}
    `.trim();

    setResult(realtimeText);
  };

  const showInstructions = () => {
    const instructions = `
🧪 ENHANCED GNSS MODULE TESTING GUIDE:

1️⃣ NEW FEATURES IN v1.0.2+:
   • 🛰️ Detailed satellite information (SVID, signal, elevation)
   • 📊 15+ helper functions for analysis
   • 📻 Research-based frequency mapping
   • 🔬 Comprehensive dual-frequency detection
   • 📱 API level compatibility checks
   • ⚡ Real-time React hooks

2️⃣ TESTING OPTIONS:

   🧪 Basic Status: Traditional GNSS check
   🔬 Satellite Analysis: Detailed per-satellite data
   📻 Frequency Analysis: Band identification & mapping
   📡 Real-time Status: Live monitoring via React hooks

3️⃣ EXPECTED RESULTS (Outdoor):

   🌟 Satellites: 8-25+ (varies by location)
   📊 Constellations: GPS + GLONASS + Galileo
   📻 Frequencies: L1 (1575.42) + others
   ⭐ Dual-Frequency: L5 (1176.45) on newer devices
   🇮🇳 NavIC: Available in India region

4️⃣ NEW CAPABILITIES:

   ✅ Individual satellite analysis
   ✅ Signal quality filtering (>25 dB-Hz)
   ✅ Constellation-specific filtering
   ✅ Frequency band identification
   ✅ Real-time event monitoring
   ✅ Comprehensive statistics

5️⃣ TROUBLESHOOTING:

   ❌ No detailed satellite data:
   → Requires Android 7.0+ (API 24+)
   
   ❌ No frequency detection:
   → Requires Android 8.0+ (API 26+)
   
   ❌ Analysis functions fail:
   → Update to latest npm package version
    `.trim();
    
    Alert.alert('📋 Enhanced Testing Guide', instructions);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛰️ Enhanced GNSS Analyzer v1.0.2+</Text>
      <Text style={styles.subtitle}>Comprehensive Satellite Analysis Toolkit</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testBasicStatus}>
          <Text style={styles.buttonText}>🧪 Test Basic Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testSatelliteAnalysis}>
          <Text style={styles.buttonText}>🔬 Satellite Analysis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testFrequencyAnalysis}>
          <Text style={styles.buttonText}>📻 Frequency Analysis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={showRealtimeStatus}>
          <Text style={styles.buttonText}>📡 Real-time Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.helpButton} onPress={showInstructions}>
          <Text style={styles.buttonText}>📋 Enhanced Guide</Text>
        </TouchableOpacity>
      </View>

      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            👆 Choose an analysis mode to test your enhanced GNSS module
            {'\n\n'}⭐ New: Detailed satellite data, frequency mapping, and real-time hooks
            {'\n\n'}💡 Best results: Test outdoors with modern Android device
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  helpButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    minHeight: 200,
  },
  resultText: {
    color: '#00FF00',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
  placeholderContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  placeholderText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
});

export default QuickGnssTest; 