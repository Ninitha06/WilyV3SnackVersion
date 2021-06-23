import React, { Component } from "react";
import {
  ImageBackground,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";

import firebase from "firebase";

const bgName = require("../images/background1.png");
const appName = require("../images/appName.png");
const appIcon = require("../images/appIcon.png");

export default class LoginScreen extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
    };
  }

  login = (email, password) => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({
          email: "",
          password: "",
        });
        this.props.navigation.navigate("BottomTab");
      })
      .catch((error) => {
        console.log(error.message);
        this.setState({
          email: "",
          password: "",
        });
        Alert.alert(error.message);
      });
  };

  render() {
    const { email, password } = this.state;
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ImageBackground source={bgName} style={styles.bgimage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <TextInput
              value={email}
              style={styles.textinput}
              onChangeText={(t) =>
                this.setState({
                  email: t,
                })
              }
              placeholder="Your email"
              placeholderTextColor="white"
              autoFocus
            />
            <TextInput
              value={password}
              style={styles.textinput}
              onChangeText={(t) =>
                this.setState({
                  password: t,
                })
              }
              placeholder="Your password"
              placeholderTextColor="white"
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.login(email, password)}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  bgimage: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  appIcon: {
    resizeMode: "contain",
    height: 280,
    width: 280,
    marginTop: 80,
  },
  appName: {
    resizeMode: "contain",
    height: 130,
    width: 130,
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center",
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  textinput: {
    width: "75%",
    height: 55,
    padding: 10,
    borderColor: "#fff",
    borderWidth: 4,
    borderRadius: 10,
    fontSize: 18,
    color: "white",
    fontFamily: "Rajdhani",
    marginTop: 20,
  },
  button: {
    width: "43%",
    height: 55,
    backgroundColor: "#F48D20",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: "Rajdhani",
    color: "white",
  },
});