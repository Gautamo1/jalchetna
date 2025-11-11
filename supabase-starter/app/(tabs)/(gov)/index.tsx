import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MONITORING_STATIONS = [
  {
    id: 'SGW-1138',
    coordinate: { latitude: 19.0760, longitude: 72.8777 },
    level: '14.2 m',
    trend: 'Rising',
    color: '#10B981'
  },
  {
    id: 'SGW-1245',
    coordinate: { latitude: 19.0896, longitude: 72.8656 },
    level: '10.5 m',
    trend: 'Stable',
    color: '#F59E0B'
  },
  {
    id: 'SGW-1367',
    coordinate: { latitude: 19.0650, longitude: 72.8900 },
    level: '8.1 m',
    trend: 'Falling',
    color: '#EF4444'
  },
];

export default function GovIndex() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleMarkerPress = (station) => {
    setSelectedStation(station);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Unified Groundwater Map</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 19.0760,
          longitude: 72.8777,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {MONITORING_STATIONS.map((station) => (
          <Marker
            key={station.id}
            coordinate={station.coordinate}
            onPress={() => handleMarkerPress(station)}
            pinColor={station.color}
          />
        ))}
      </MapView>

      {/* Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            
            {selectedStation && (
              <>
                <View style={styles.stationInfo}>
                  <View>
                    <Text style={styles.stationId}>Station ID: {selectedStation.id}</Text>
                    <Text style={[styles.trend, { color: selectedStation.color }]}>
                      Trend: {selectedStation.trend}
                    </Text>
                  </View>
                  <View style={styles.levelContainer}>
                    <Text style={styles.levelLabel}>Current Level</Text>
                    <Text style={styles.levelValue}>{selectedStation.level}</Text>
                  </View>
                </View>

                <View style={styles.chartPlaceholder}>
                  <Text style={styles.chartIcon}></Text>
                  <Text style={styles.chartText}>Trend Chart</Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.alertButton}>
                    <Text style={styles.alertButtonText}>Set Alert</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reportButton}>
                    <Text style={styles.reportButtonText}>View Full Report</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="map" size={24} color="#0891B2" />
          <Text style={[styles.navLabel, styles.navActive]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="stats-chart" size={24} color="#6B7280" />
          <Text style={styles.navLabel}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications" size={24} color="#6B7280" />
          <Text style={styles.navLabel}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="menu" size={24} color="#6B7280" />
          <Text style={styles.navLabel}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuButton: {
    padding: 5,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 100,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  stationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stationId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
  },
  trend: {
    fontSize: 14,
    fontWeight: '500',
  },
  levelContainer: {
    alignItems: 'flex-end',
  },
  levelLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  chartPlaceholder: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  chartIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  chartText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  alertButton: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#0369A1',
    fontSize: 14,
    fontWeight: '600',
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#0891B2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  navActive: {
    color: '#0891B2',
    fontWeight: '600',
  },
});
