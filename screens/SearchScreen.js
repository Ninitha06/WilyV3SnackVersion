import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from "react-native";

import { ListItem, Icon } from "react-native-elements";

import db from "../config";

export default class SearchScreen extends Component {
  constructor() {
    super();
    this.state = {
      allTransactions: [],
      searchText: "",
      lastVisibleTransaction: null,
    };
  }

  componentDidMount() {
    this.getAllTransactions();
  }

  getAllTransactions = () => {
    db.collection("transactions")
      .limit(10)
      .get()
      .then((snapshot) => {
        snapshot.docs.map((doc) => {
          this.setState({
            allTransactions: [...this.state.allTransactions, doc.data()],
            lastVisibleTransaction: doc,
          });
        });
      });
  };

  fetchMoreTransactions = async (text) => {
    text = text.toUpperCase();
    var enteredText = text.split("");

    const { allTransactions, lastVisibleTransaction } = this.state;

    if (enteredText[0] == "B") {
      db.collection("transactions")
        .where("book_id", "==", text)
        .startAfter(lastVisibleTransaction)
        .limit(10)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => {
            this.setState({
              allTransactions: [...allTransactions, doc.data()],
              lastVisibleTransaction: doc,
            });
          });
        });
    } else if (enteredText[0] == "S") {
      db.collection("transactions")
        .where("student_id", "==", text)
        .startAfter(lastVisibleTransaction)
        .limit(10)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => {
            this.setState({
              allTransactions: [...allTransactions, doc.data()],
              lastVisibleTransaction: doc,
            });
          });
        });
    }
  };

  handleSearch = (text) => {
    text = text.toUpperCase();
    var chars = text.split("");

    this.setState({
      allTransactions: [],
    });

    if (!text) {
      this.getAllTransactions();
    }

    if (chars[0] == "B") {
      db.collection("transactions")
        .where("book_id", "==", text)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => {
            this.setState({
              allTransactions: [...this.state.allTransactions, doc.data()],
              lastVisibleTransaction: doc,
            });
          });
        });
    } else if (chars[0] == "S") {
      db.collection("transactions")
        .where("student_id", "==", text)
        .get()
        .then((snapshot) => {
          snapshot.docs.map((doc) => {
            this.setState({
              allTransactions: [...this.state.allTransactions, doc.data()],
              lastVisibleTransaction: doc,
            });
          });
        });
    }
  };
  renderItem = ({ item, index }) => {
    var date = item.date.toDate().toString().split("").splice(0, 3).join("");

    var transactionType =
      item.transaction_type == "issue" ? "issued" : "returned";

    return (
      <View style={{ borderWidth: 1 }}>
        <ListItem key={index} bottomDivider>
          <Icon type={"antdesign"} name={"book"} size={40} />
          <ListItem.Content>
            <ListItem.Title style={styles.title}>
              {`${item.book_name}(${item.book_id})`}
            </ListItem.Title>
            <ListItem.Subtitle style={styles.subtitle}>
              {item.transaction_type === "issue"
                ? `This book ${transactionType} to ${item.student_name}`
                : `This book ${transactionType} by ${item.student_name}`}
            </ListItem.Subtitle>
            <View style={styles.lowerLeftContainer}>
              <View style={styles.transactionContainer}>
                <Text
                  style={[
                    styles.transactionText,
                    {
                      color:
                        item.transaction_type == "issue"
                          ? "#78D304"
                          : "#0364F4",
                    },
                  ]}
                >
                  {item.transaction_type.charAt(0).toUpperCase() +
                    item.transaction_type.slice(1)}
                </Text>
                <Icon
                  type={"ionicon"}
                  name={
                    item.transaction_type === "issue"
                      ? "checkmark-circle-outline"
                      : "arrow-redo-circle-outline"
                  }
                  color={
                    item.transaction_type === "issue" ? "#78D304" : "#0364F4"
                  }
                />
              </View>
              <Text style={styles.date}>{date}</Text>
            </View>
          </ListItem.Content>
        </ListItem>
      </View>
    );
  };
  render() {
    const { allTransactions, searchText } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type Here"
              placeholderTextColor="#fff"
              value={searchText}
              onChangeText={(t) => {
                this.setState({ searchText: t });
              }}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.handleSearch(searchText)}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.lowerContainer}>
          <FlatList
            data={allTransactions}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={() => this.fetchMoreTransactions()}
            onEndReachedThreshold={0.7}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#5653D4",
    flex: 1,
  },
  upperContainer: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },
  lowerContainer: {
    flex: 0.8,
    //backgroundColor: '#fff',
  },
  textInputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#fff",
    backgroundColor: "#9DFD24",
    flexDirection: "row",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  textInput: {
    width: "60%",
    height: 50,
    padding: 10,
    borderColor: "#fff",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    fontFamily: "Rajdhani",
    color: "white",
    backgroundColor: "#5653D4",
  },
  buttonText: {
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "Rajdhani",
  },
  title: {
    fontSize: 14,
    fontFamily: "Rajdhani",
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Rajdhani",
  },
  lowerLeftContainer: {
    marginTop: -40,
    alignSelf: "flex-end",
  },
  transactionContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  transactionText: {
    fontFamily: "Rajdhani",
    fontSize: 20,
  },
  date: {
    fontSize: 12,
    paddingTop: 5,
    fontFamily: "Rajdhani",
  },
});