import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ImageBackground,
  Image,
  TextInput,
  Alert,
} from "react-native";

import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import firebase from "firebase";

//Note : if u get firebase.firestore is undefined or not a function, 
//put "@firebase/app": "0.x.0" before app-types and firestore and it will work
// Again, things will revert back to app coming to the end after app-types.

import db from "../config";
import LoginScreen from "./LoginScreen";

const bgImage = require("../images/background1.png");
const appImg = require("../images/appIcon.png");
const appName = require("../images/appName.png");

export default class TransactionScreen extends Component {
  constructor() {
    super();

    this.state = {
      domState: "normal",
      scanned: false,
      hasCameraPermissions: null,
      studentId: "",
      bookId: "",
      studentName: "",
      bookName: "",
    };
  }

  componentDidMount() {
 
    this._unsubscribe = this.props.navigation.addListener("tabPress", () => {
      console.log("Am getting called");
      this.setState({
        domState: "normal",
      });
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  handleTransaction = async () => {
    var { studentId, bookId } = this.state;

    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId);

    var transactionType = await this.checkBookAvailability(bookId);

    if (transactionType == "issue") {
      let isEligible = await this.checkStudentEligibilityForBookIssue(
        studentId
      );

      if (isEligible) {
        let { bookName, studentName } = this.state;
        await this.initiateBookIssue(bookId, bookName, studentId, studentName);
        Alert.alert("Book " + bookName + " Issued to Student " + studentName);
      }
    } else if (transactionType == "return") {
      let isEligible = await this.checkStudentEligibilityForBookReturn(
        bookId,
        studentId
      );

      if (isEligible) {
        let { bookName, studentName } = this.state;
        await this.initiateBookReturn(bookId, bookName, studentId, studentName);
        Alert.alert("Book " + bookName + " returned by Student " + studentName);
      }
    } else if (!transactionType) {
      this.setState({
        bookId: "",
        studentId: "",
      });
      Alert.alert(
        "No Such Book with book Id " + bookId + " available in the library"
      );
    }
  };

  handleBarCodeScanned = ({ type, data }) => {
    const { domState } = this.state;
    if (domState == "studentId") {
      this.setState({
        studentId: data,
        scanned: true,
        domState: "normal",
      });
    } else if (domState == "bookId") {
      this.setState({
        bookId: data,
        scanned: true,
        domState: "normal",
      });
    }
  };

  getBookDetails = async (bookId) => {
    bookId = bookId.trim();
    db.collection("books")
      .where("book_id", "==", bookId)
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          this.setState({
            bookName: doc.data().book_name,
          });
        });
      });
  };

  //Doesnt work when using Switch Navigator as Switch uses React 4 whereas Tab uses React 5. Best is to use Stack
  handleLogout = async () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.navigation.navigate("Login");
      })
      .catch(function (error) {
        // An error happened.
        console.log(error);
      });
  };

  getStudentDetails = async (studentId) => {
    studentId = studentId.trim();
    db.collection("students")
      .where("student_id", "==", studentId)
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          this.setState({
            studentName: doc.data().student_name,
          });
        });
      });
  };

  checkBookAvailability = async (bookId) => {
    const bookRef = await db
      .collection("books")
      .where("book_id", "==", bookId)
      .get();

    var transactionType = "";
    if (bookRef.docs.length == 0) {
      transactionType = false;
    } else {
      bookRef.docs.map((doc) => {
        transactionType = doc.data().is_book_available ? "issue" : "return";
      });
    }

    return transactionType;
  };

  checkStudentEligibilityForBookIssue = async (studentId) => {
    const studentRef = await db
      .collection("students")
      .where("student_id", "==", studentId)
      .get();

    var isStudentEligible = "";

    if (studentRef.docs.length == 0) {
      isStudentEligible = false;
      this.setState({
        bookId: "",
        studentId: "",
      });
      Alert.alert("Student Id does not exist in database");
    } else {
      studentRef.docs.map((doc) => {
        if (doc.data().number_of_books_issued <= 1) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          this.setState({
            bookId: "",
            studentId: "",
          });
          Alert.alert("Student has already been issued 2 books");
        }
      });
    }

    return isStudentEligible;
  };

  checkStudentEligibilityForBookReturn = async (bookId, studentId) => {
    const transactionsRef = await db
      .collection('transactions')
      .where('book_Id', '==', bookId)
      .orderBy('date', 'desc')
      .limit(1)
      .get();

    var isStudentEligible = "";
    if (transactionsRef.docs.length == 0) {
      isStudentEligible = false;
      this.setState({
        bookId: "",
        studentId: "",
      });
      Alert.alert("This Book was never issued to be eligible for return");
    } else {
      transactionsRef.docs.map((doc) => {
        if (doc.data().student_id == studentId) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          this.setState({
            studentId: "",
            bookId: "",
          });
          Alert.alert("This Book was never issued to Student " + studentId);
        }
      });
    }
    return isStudentEligible;
  };

  initiateBookIssue = async (bookId, bookName, studentId, studentName) => {
    db.collection("transactions").add({
      book_id: bookId,
      book_name: bookName,
      student_id: studentId,
      student_name: studentName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue",
    });

    db.collection("books").doc(bookId).update({
      is_book_available: false,
    });

    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(1),
      });

    this.setState({
      bookId: "",
      studentId: "",
      bookName: "",
      studentName: "",
    });
  };

  initiateBookReturn = async (bookId, bookName, studentId, studentName) => {
    db.collection("transactions").add({
      book_id: bookId,
      book_name: bookName,
      student_id: studentId,
      student_name: studentName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return",
    });

    db.collection("books").doc(bookId).update({
      is_book_available: true,
    });

    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(-1),
      });

    this.setState({
      bookId: "",
      studentId: "",
      bookName: "",
      studentName: "",
    });
  };

  getCameraPermissions = (domState) => {
    const { status } = Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      scanned: false,
      hasCameraPermissions: status === "granted",
      domState: domState,
    });
  };
  render() {
    const { domState, scanned, studentId, bookId } = this.state;
    if (domState != "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <ImageBackground source={bgImage} style={styles.bg}>
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.button, { height: 35, width: "25%" }]}
            onPress={this.handleLogout}
          >
            <Text style={[styles.buttonText, { fontSize: 18 }]}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.upperContainer}>
          <Image source={appImg} style={styles.icon} />
          <Image source={appName} style={styles.appName} />
        </View>
        <View style={styles.lowerContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={bookId}
              placeholder={"Book Id"}
              placeholderTextColor="#fff"
              onChangeText={(text) => this.setState({ bookId: text })}
            ></TextInput>
            <TouchableOpacity
              style={styles.scanbutton}
              onPress={() => this.getCameraPermissions("bookId")}
            >
              <Text style={styles.scanbuttontext}>Scan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={studentId}
              placeholder={"Student Id"}
              placeholderTextColor="#fff"
              onChangeText={(text) => this.setState({ studentId: text })}
            ></TextInput>
            <TouchableOpacity
              style={styles.scanbutton}
              onPress={() => this.getCameraPermissions("studentId")}
            >
              <Text style={styles.scanbuttontext}>Scan</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleTransaction}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  bg: {
    resizeMode: "cover",
    flex: 1,
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center",
  },
  icon: {
    resizeMode: "contain",
    width: 200,
    height: 200,
    marginTop: 80,
  },
  appName: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  textInputContainer: {
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    margin: 10,
  },
  textInput: {
    borderWidth: 3,
    borderRadius: 10,
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#fff",
    color: "#fff",
    fontSize: 18,
    fontFamily: "Rajdhani",
  },
  scanbutton: {
    width: 100,
    height: 50,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  scanbuttontext: {
    color: "#0A0101",
    fontSize: 24,
    fontFamily: "Rajdhani",
  },
  button: {
    backgroundColor: "#F48D20",
    justifyContent: "center",
    alignItems: "center",
    width: "43%",
    height: 55,
    borderRadius: 15,
    marginTop: 25,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: "Rajdhani",
    color: "#fff",
  },
  logoutContainer: {
    alignItems: "flex-end",
    marginTop: 20,
  },
});
