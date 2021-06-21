import React, { Component, useState,useEffect  } from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  Switch,
  TouchableOpacity,
  ToastAndroid,
  ImageBackground,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Image,
  SafeAreaView,
  TouchableHighlight

} from 'react-native';
var _ = require('lodash');
var Data = "Data";
var Data_arr = []; 
import BluetoothSerial from 'react-native-bluetooth-serial-next'
import renderIf from './renderif'

const renderEmpty = () => <Text style={{  fontSize: 28, 
    textAlign: 'center',
  color: 'white'}}
  > ---No device---</Text>  ;


export default class App extends  React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: [],
      connected: false,
      count: 0,
      isHidden: false,
      status: true,
      humidity:"",
      temp:"",
      number: 0,
      rain: "",
      uri: require('./Image/sunny.jpg')
    }
  }
  


  toggleStatus(){
    this.setState({
      status:!this.state.status
    });
    console.log('toggle button handler: '+ this.state.status);
  }


  componentWillMount(){
 
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
    .then((values) => {
      const [ isEnabled, devices ] = values
 
      this.setState({ isEnabled, devices })
    })
 
    BluetoothSerial.on('bluetoothEnabled', () => {
 
      Promise.all([
        BluetoothSerial.isEnabled(),
        BluetoothSerial.list()
      ])
      .then((values) => {
        const [ isEnabled, devices ] = values
        this.setState({  devices })
      })
 
      BluetoothSerial.on('bluetoothDisabled', () => {
 
         this.setState({ devices: [] })
 
      })
      BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))


    })
 
  }
  connect (device) {
    this.setState({ connecting: true })
    BluetoothSerial.connect(device.id)
    .then((res) => {
      console.log(`Connected to device ${device.name}`);
      
      ToastAndroid.show(`Connected to device ${device.name}`, ToastAndroid.SHORT);
    })
    .catch((err) => console.log((err.message)))
  }

  _renderItem(item){
 
    return(<TouchableOpacity style={styles.wrapper} onPress={() => this.connect(item.item)}>
           <View style={styles.wrapperLeft}>
            <Image style={styles.iconLeft} source={require('./Image/3.jpg')}/>
            </View>
            <View style={styles.deviceNameWrap}>
            <Text style={styles.deviceName}>{ item.item.name ? item.item.name : item.item.id }</Text>
            </View>
            <Image style={styles.iconRight} source={require('./Image/4.jpg')}/>

          </TouchableOpacity>)
  }

  enable () {
    BluetoothSerial.enable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => Toast.showShortBottom(err.message))
  }
  disable () {
    BluetoothSerial.disable()
    .then((res) => this.setState({ isEnabled: false }))
    .catch((err) => Toast.showShortBottom(err.message))
  }
  toggleBluetooth (value) {
    if (value === true) {
      this.enable()
    } else {
      this.disable()
    }
  }
  discoverAvailableDevices () {
    
    if (this.state.discovering) {
      return false
    } else {
      this.setState({ discovering: true })
      BluetoothSerial.discoverUnpairedDevices()
      .then((unpairedDevices) => {
        const uniqueDevices = _.uniqBy(unpairedDevices, 'id');
        console.log(uniqueDevices);
        this.setState({ unpairedDevices: uniqueDevices, discovering: false })
      })
      .catch((err) => console.log(err.message))
    }
  }
  writeData(){
    BluetoothSerial.write("H")
    .then((res) => {
      console.log(res);
      console.log('Successfuly wrote to device')
      this.setState({ connected: true })
      
    })
    .catch((err) => console.log(err.message))
  }
  readData(){
    BluetoothSerial.readFromDevice().
    then((res) => {
      var strArr = res.split('');
      Data_arr = [strArr[strArr.length-7], strArr[strArr.length-6], strArr[strArr.length-5],strArr[strArr.length-4], strArr[strArr.length-3], strArr[strArr.length-2], strArr[strArr.length-1]];
      //console.log(strArr[strArr.length-1]);
      ToastAndroid.show(`Data =   ${Data_arr}`, ToastAndroid.SHORT);
      Data = Data_arr;
      this.state.temp = strArr[strArr.length-7] +strArr[strArr.length-6] + "." +strArr[strArr.length-5];
      this.state.humidity= strArr[strArr.length-4] +strArr[strArr.length-3] + "." +strArr[strArr.length-2];
      this.state.rain = strArr[strArr.length-1];
      strArr = [];
      this.setState({ connected: true })
      if (Data[0] == 1)
        {
          this.setState({
            uri: require('./Image/rain.jpg')
          });
          this.setState({
            rain: "Raining"
          });
        }
      else
        {
          if(Data[1] > 2)
            {
              this.setState({
                uri: require('./Image/sunny.jpg')
              });
            }
          else
            {
              this.setState({
                uri: require('./Image/cool.jpg')
              });
            }
          this.setState({
            rain: "No Rain"
          });
        }
    })
    .catch((err) => console.log(err.message))
  }

  render() {
    

    return (
      <View style={{backgroundColor: '#FFFFFF' , flex: 1}}>
      {renderIf(this.state.status)(
     <ImageBackground source={require('./Image/1.jpg')} style={styles.image}>
        <View style={styles.container} >
    

    <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Bluetooth Device Lists</Text>
          <View style={styles.toolbarButton}>
            <Switch
              value={this.state.isEnabled}
              onValueChange={(val) => this.toggleBluetooth(val) }
            />
          </View>
          
    </View> 
      <Button
        onPress={this.discoverAvailableDevices.bind(this)}
        title="Scan for Devices"
        color="#2C3530"

        
      />
      <FlatList
        style={{flex:1}}
        data={this.state.devices}
        keyExtractor={item => item.id}
        renderItem={(item) => this._renderItem(item)}
        ListEmptyComponent={renderEmpty}
      />
     
    </View>
       
       </ImageBackground>
      )}
{renderIf(!this.state.status)(
     <ImageBackground source={require('./Image/2.jpg')} style={styles.image}>
 
        <View style={styles.Weather_Box_Main}>
          <View style={styles.Weather_Holder_View}>
               <Image  source={this.state.uri} style={styles.Weather_Image}/>
              <View>
            
                <Text  style={styles.text}>{this.state.temp} °C</Text>
                <Text  style={styles.text}>{this.state.humidity} %</Text>
                <Text  style={styles.text}>{this.state.rain} 🌧 </Text>
              </View>
            </View>
        </View>

   
        <View style={styles.container} >
        
        <TouchableOpacity style={{top: 130}}  onPress={this.writeData.bind(this)}>
          <Image
            style={{width: 100, height: 100, alignSelf:"center"}}
            source={require('./Image/button.jpg')}
          />
        </TouchableOpacity>
        <TouchableOpacity style={{top: 200}} onPress={ this.readData.bind(this)}>
          <Image
            style={{width: 100, height: 100, alignSelf:"center"}}
            source={require('./Image/loading.jpg')}
          />
        </TouchableOpacity>
        </View>
        
       </ImageBackground>
      )}



      <Button color="#2C3539"  title={this.state.status ? "Detail" : "Setting device"}  onPress={()=>this.toggleStatus()
      } />
       

    </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
   //backgroundColor: '#FFFFFF',
  },
  icon: {

    width: 100,
    height: 100,

},

  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  toolbar:{
    paddingTop:30,
    paddingBottom:20,
    flexDirection:'row',
    backgroundColor: "#E56717",
  },
  toolbarButton:{
    width: 50,
    marginTop: 8,
    marginRight: 10,
    
  },
  toolbarTitle:{
    textAlign:'center',
    fontWeight:'bold',
    fontSize: 25,
    flex:1,
    marginTop:6,
  },
  deviceName: {
    fontSize: 20,
    color: "black",
    fontWeight:'bold',
  },
  deviceNameWrap: {
    right: 50,
    margin: 10,
    paddingLeft: 50,


    //borderBottomWidth:1
  },
  Weather_Box_Main:{
    top: 50,
    height:"30%",
    width:"100%",
    justifyContent:"center",
    alignItems:"center",
    flexDirection:"row"
  },
  Weather_Holder_View:{
    height:"80%",
    width:"90%",
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius:15,
    alignItems:"center",
    flexDirection:"row"
  },
  Weather_Image:{
    height:"40%",
    width:"40%"
  },
  text:{
    fontSize:20,
    color:"#FFF",
    marginLeft:"5%",
    marginTop:"3%"
  },
  iconLeft:{
    width: 30,
    height: 30
  },
  iconRight:{
    width: 20,
    height: 20
  },
  wrapperLeft:{
    width:40,
    height: 40, 
    left: 10,
    borderRadius:20,
    borderColor: 'gray',
    borderWidth: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'

  },
  wrapper:{

    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
},
    
});

//const [isShow, setisShow] = useState(true)