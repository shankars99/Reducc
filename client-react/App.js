import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, View, Button, TextInput } from 'react-native';
import React from "react";
var forge = require('node-forge');

//importing BigInt to perform modPow for RSA encryption
var BigInt = require("big-integer");

//server url
const url = 'http://bf3a9254e635.ngrok.io'


//creating a react component class
class App extends React.Component {

  //n,e are from the public key generated by the server for us to encrypt
  constructor() {
    super();
    this.state = {
      plainText: "",
      summarizedText: "",
      serverKey: {
        n: 0.0,
        e: 0.0
      },
      clientKey: {
        n: 0.0,
        d: 0.0,
        e: 0.0
      },
    }
  };

  //RSA encryption
  //As react native does not support BigInteger class we need to encode substrings of a size such that when it
  //exponeniates in the m^e%n it doesn't overflow and we lose data.
  rsa_encode = () => {

    //split the input into word tokens
    //converting to uppercase so as to maintain consistency of ASCII lengths, as a is 97 and c is 100
    //also because numbers and other symbols are also of width : 2

    var words = this.state.plainText.toUpperCase().split(' ');
    var cipherText = ""
    const SubSubWordTokenSize = 15
    //iterate through each token so as to split then into subtokens of manageable sizes as some tokens are too large
    for (let wordToken in words) {
      var cipherToken = ""

      //split the tokens into subtokens of length 4
      var subWordTokens = words[wordToken].match(/.{1,4}/g);

      //iterate through the sub-sub-tokens and encode them
      for (var subSubWordToken in subWordTokens) {

        var collectionOfSubSubWordTokenChars = ""

        //iterate through the sub-sub-tokens to encode
        for (let subSubWordTokenChars in subWordTokens[subSubWordToken]) {

          //get the ASCII value of the character in the sub-sub-token
          collectionOfSubSubWordTokenChars += subWordTokens[subSubWordToken][subSubWordTokenChars].charCodeAt()
        }
        cipherToken = BigInt(collectionOfSubSubWordTokenChars).modPow(this.state.serverKey.e, this.state.serverKey.n).toString()

        //pad a character at the end to make all the encoded words have the same size of 15
        cipherText += cipherToken.padEnd(SubSubWordTokenSize, '~')
      }
      //add a space bar to the end of the word
      cipherText += " "
    }
    //console.log(cipherText)
    return (cipherText)
  }

  rsa_decode(cipherText) {
    var words = cipherText.split(' ');
    var plainText = "";

    //group together number of integers to convert to ASCII
    var subSubWordTokenSize = 2

    //iterate through the words
    for (var wordToken in words) {

      //get the formatted subword list
      var subWordTokens = words[wordToken].match(/.{1,15}/g);
      //iterate through each subword and decode them
      for (var subSubWordTokens in subWordTokens) {

        var plain_token = subWordTokens[subSubWordTokens].toString().replace('~', '')
        var decoded_token = BigInt(parseInt(plain_token)).modPow(this.state.clientKey.d, this.state.clientKey.n).toString()
        var i = 0
        while (i < decoded_token.length) {
          //splice the range over 2 integer values and get ASCII character
          plainText += String.fromCharCode((decoded_token.substring(i, i + subSubWordTokenSize)));
          i += subSubWordTokenSize;
        }
      }
      plainText += " "
    }
    return plainText
  }

  rsa_keyGen() {
    var bits = 24;
    var p = 0;
    var q = 0;

    //generate two primes of 24 bits
    forge.prime.generateProbablePrime(bits, function (err, num) {
      p = num.data[0];
    });
    forge.prime.generateProbablePrime(bits, function (err, num) {
      q = num.data[0];
    });

    //calculate the public key and private key of the server
    var n = p * q
    var phi_n = (p - 1) * (q - 1)
    var e = 65537
    var d = BigInt(e).modInv(phi_n)
    this.setState({
      clientKey: {
        n: n,
        e: e,
        d: d
      }
    })
  }
  //sends a HTTP-POST request with the cipherText as json to the server
  getSummary = () =>
    fetch(url + "/summarize", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cipher_text: this.rsa_encode(), n: this.state.clientKey.n }),

    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          summarizedText: this.rsa_decode(responseJson.summarized_text).toLowerCase()
        })
        console.log("\nsummarized text : " + this.state.summarizedText)
      })
      .catch((error) => {
        console.error(error);
      });


  //on loading the program get the public keys from the server
  componentDidMount = () =>
    fetch(url + '/getKey', {
      method: 'GET'
    })
      .then((response) => response.json())
      .then((public_key) => {
        console.log("\nPUBLIC KEY OF SERVER :\n", public_key)
        this.setState({
          serverKey: {
            n: public_key.n,
            e: public_key.e
          }
        })
        //generate client's public keys
        this.rsa_keyGen()
        console.log("\KEYS OF CLIENT :\n", this.state.clientKey)
      })
      .catch((error) => {
        console.error(error);
      });

  //remove any trailing space-bars
  updatePlainText = (text) => this.setState({ plainText: text.trim() })

  render() {
    return (
      <View style={styles.container}>

        {/* Input text-box that sets the state of plainText */}
        <ScrollView showsVerticalScrollIndicator={true}>
          <TextInput style={styles.input}
            underlineColorAndroid="transparent"
            placeholder="Enter the text"
            autoCapitalize="none"
            multiline={true}
            onChangeText={this.updatePlainText} />
        </ScrollView>

        {/* On button press calls sends the HTTP-POST request*/}
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => { this.getSummary() }}
            title="Summarize"
          />

          {/* Output text-box that shows the response (i.e the summarized text) */}
          <ScrollView>
            <TextInput style={styles.input}
              underlineColorAndroid="transparent"
              placeholder={this.state.summarizedText}
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
    margin: 30
  },
  buttonContainer: {
  },
  input: {
    paddingBottom: 20,
    paddingLeft: 10,
    borderColor: '#7a42f4',
    borderWidth: 1,
    flexWrap: 'wrap'
  }
});

export default App;

/*
function rsa_decode(cipherText) {
  var words = cipherText.split(' ');
  var plainText = "";

  //group together number of integers to convert to ASCII
  var subSubWordTokenSize = 2

  //iterate through the words
  for (wordToken in words) {

    //get the formatted subword list
    var subWordTokens = words[wordToken].match(/.{1,15}/g);
    //iterate through each subword and decode them
    for (subSubWordTokens in subWordTokens) {

      //RSA decoding using the private key: c ^ d % n
      decoded_token = subWordTokens[subSubWordTokens]**d%n

      //group together the characters so as to form words, since each group has 2 characters, iterate to half the length
      var i = 0
      while (i < x.length) {
        //splice the range over 2 integer values and get ASCII character
        plainText += (x.substring(i, i + subSubWordTokenSize))
        i += subSubWordTokenSize;
      }
    }

    //add a space - bar to the end of the word
    plainText += " "
  }
  return plainText
}

function rsa_decode(cipherText) {
  var words = cipherText.split(' ');
  var plainText = "";

  //group together number of integers to convert to ASCII
  var subSubWordTokenSize = 2

  //iterate through the words
  for (wordToken in words) {

    //get the formatted subword list
    var subWordTokens = words[wordToken].match(/.{1,15}/g);
    //iterate through each subword and decode them
    for (subSubWordTokens in subWordTokens) {
      r = parseInt(subWordTokens[subSubWordTokens].replace('~', ''))
      decoded_token = BigInt(r) ** BigInt(d) % BigInt(n)
      console.log(r + " " + decoded_token)

    }
    plainText += " "
  }
  return plainText
}*/