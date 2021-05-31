import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, View, Button, TextInput } from 'react-native';
import React from "react";
var BigInt = require("big-integer");

const url = 'https://59df4201a50f.ngrok.io'

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      raw_text: "",
      summarized_text: "",
      n: 0.0,
      e: 0.0
    }
  };

  updateRawText = (text) => {
    this.setState({ raw_text: text.trim() })
  }

  handlePress = () => {
    var raw_split = this.state.raw_text.toUpperCase().split(' ');
    console.log(raw_split)

    var cipher = ""
    for (let msg in raw_split) {
      var c = ""
      var sub_msgs = raw_split[msg].match(/.{1,4}/g);
      console.log(sub_msgs)
      for (var ele in sub_msgs) {
        var m = ""
        console.log(sub_msgs[ele])
        for (let sub_ele in sub_msgs[ele]){
          //console.log(sub_msgs[ele][sub_ele].charCodeAt() + 3)
          m += sub_msgs[ele][sub_ele].charCodeAt()
        }
        c = BigInt(m).modPow(BigInt(this.state.e), BigInt(this.state.n)).toString()
        console.log("m " + m)
        cipher += c.padEnd(15,'-')

        console.log("c "+c + "   " + c.length)
      }
      cipher += " "
      //console.log(BigInt(m))
     /* m = parseInt(m)*/
    }
    console.log("cipher = " + cipher)

    fetch(url + "/summarize",{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({msg : cipher}),

    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          summarized_text: responseJson.message
        })
      })
      .catch((error) => {
        console.error(error);
      });
  }

  componentDidMount = () => {
    fetch(url + '/get_key', {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
        this.setState({
          n: responseJson.n,
          e: responseJson.e
        })
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>

        <TextInput style={styles.input}
          underlineColorAndroid="transparent"
          placeholder="Enter the text"
          autoCapitalize="none"
          multiline={true}
          onChangeText={this.updateRawText} />
            </ScrollView>
        <View style={styles.buttonContainer}>

          <Button
            onPress={() => {
              this.handlePress()
            }}
            title="Summarize"
          />
          <ScrollView>
          <TextInput style={styles.input}
            underlineColorAndroid="transparent"
            placeholder={this.state.summarized_text}
            autoCapitalize="none"
            multiline={true}
            editable={false} />
            </ScrollView>
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    padding: 10,
    margin:30
  },
  buttonContainer: {
  },
  input: {
    paddingBottom: 200,
    paddingLeft: 10,
    borderColor: '#7a42f4',
    borderWidth: 1
  }
});

export default App;
