/*The Chrysler Building the famous art deco New York skyscraper will be sold for a small fraction of its previous sales price . The deal first reported by The Real Deal was for  million according to a source familiar with the deal Mubadala an Abu Dhabi investment fund purchased  of the building for  million in Real estate firm Tishman Speyer had owned the other . The buyer is RFR Holding a New York real estate company Officials with Tishman and RFR did not immediately respond to a request for comments Its unclear when the deal will close . The building sold fairly quickly after being publicly placed on the market only two months ago . The sale was handled by CBRE Group . The incentive to sell the building at such a huge loss was due to the soaring rent the owners pay to Cooper Union a New York college for the land under the building . The rent is rising from  million last year to  million this year to  million in Meantime rents in the building itself are not rising nearly that fast While the building is an iconic landmark in the New York skyline it is competing against newer office towers with large floor to ceiling windows and all the modern amenities . Still the building is among the best known in the city even to people who have never been to New York . It is famous for its triangleshaped vaulted windows worked into the stylized crown along with its distinctive eagle gargoyles near the top . It has been featured prominently in many films including Men in Black  Spider-Man Armageddon Two Weeks Notice and Independence Day . The previous sale took place just before the  financial meltdown led to a plunge in real estate prices Still there have been a number of high profile skyscrapers purchased for top dollar in recent years including the Waldorf Astoria hotel which Chinese firm Anbang Insurance purchased in  for nearly  billion and the Willis Tower in Chicago which was formerly known as Sears Tower once the worlds tallest Blackstone Group BX bought it for  billion . The Chrysler Building was the headquarters of the American automaker until  but it was named for and owned by Chrysler chief Walter Chrysler not the company itself . Walter Chrysler had set out to build the tallest building in the world a competition at that time with another Manhattan skyscraper under construction at  Wall Street at the south end of Manhattan . He kept secret the plans for the spire that would grace the top of the building building it inside the structure and out of view of the public until  Wall Street was complete . Once the competitor could rise no higher the spire of the Chrysler building was raised into view giving it the title
*/

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

