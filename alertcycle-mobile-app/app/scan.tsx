import {CameraView, CameraType,useCameraPermissions} from 'expo-camera';
import React, { useState } from 'react';
import {StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function Scanning() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    
    if(!permission){
        return<View/>;
    }
    if(!permission.granted){
        return(
            <View style={styles.containers}>
                <Text>Camera Permission Required</Text>
                <TouchableOpacity onPress={requestPermission}>
                    <Text>Request Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }
    function toggleCameraFacing(){
        setFacing(current => (current === 'front' ? 'back' : 'back'));
    }

    return (
        <View style={styles.containers}>
          <CameraView style={styles.camera} facing={facing}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      );
    }

const styles = StyleSheet.create({
    containers: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
      },
      camera: {
        flex: 1,
      },
      buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
      },
      button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
      },
      text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
      },
})