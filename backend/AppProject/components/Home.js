import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Card, FAB, Button } from "react-native-paper"; 
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home(props) {
  //Props ne mozemo menjati, sta prosledimo u zagradama to uvek stoji, zbog toga mozemo koristiti state
  //Dok kod klasne komponente mozemo menjati props

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [data, setData] = useState([]);
  const [loading, setIsLoading] = useState(true);

  function numericDate(d) {
    let currentDay = d.getDate();
    let currentMonth = d.getMonth() + 1;
    let currentYear = d.getFullYear();
    let currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
    return currentDate;
  }

  const loadAsyncData = async () => {
    try {
      var jsonValue;
      value = await AsyncStorage.getItem("Excercises").then((values) => {
        values = JSON.parse(values);
        values = values.filter((value) => value.uidate == numericDate(date));
        jsonValue = values;
        setData(jsonValue);
        setIsLoading(false);
      });
    } catch (error) {
      console.log("Error: ", error);
    }
    return jsonValue;
  };

  const [date, setDate] = useState(new Date());

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setDate(date);
    hideDatePicker();
  };

  const incrementDate = () => {
    let newDate = new Date(date.getTime());
    newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  const decrementDate = () => {
    let newDate = new Date(date.getTime());
    newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  function dateTostring(d) {
    let currentDay = d.getDate();
    let currentMonth = monthNames[d.getMonth()];
    let currentYear = d.getFullYear();
    let currentDate = `${currentDay}-${currentMonth}-${currentYear}`;
    return currentDate;
  }

  /*REDUCE HOOK
  const [state, dispatch] = useReducer(reducer, {count: 0, showText: true}) 
  -ovo je usereducer hook, koristimo ga kada imamo vise stateova i zelimo odjednom da ih menjamo
  -state predstavlja sva nasa stanja data,loading... a dispatch ih menja. reducer je funkcija koju koristimo i u {} idu inicijalna stanja 
  const reducer = (state, action) => {
    switch(action.type) {
      case "INCREMENT":
        return {count: state.count + 1, showText: state.showText}
      case "toggleShowText":
        return {count: state.count, showText: !state.showText}
      default:
        return state
    }
  }
  I onda posle u htmlu pristupamo sa {state.count}, {state.showText} a kod onClicka kazemo dispatch({type:"INCREMENT"})
  */

  const loadData = () => {
    const dateString = dateTostring(date);
    fetch(`http://192.168.56.1:3000/get_by_date/excercises/${dateString}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((excercise) => {
        setData(excercise);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.message == "Network request failed") {
          console.log("Greska u mrezi: " + error.message);
        } else console.log(error);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      //loadData();
      loadAsyncData();
      return () => {};
    }, [date])
  );

  const clickedItem = (data) => {
    props.navigation.navigate("Details", { data: data });
  };

  const renderData = (item) => {
    return (
      <Card style={styles.cardStyle}>
        <Text style={{ fontSize: 20 }} onPress={() => clickedItem(item)}>
          {item.title}
        </Text>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          marginLeft: 20,
          justifyContent: "space-evenly",
        }}
      >
        <Button onPress={decrementDate}>{"<"}</Button>
        <Button onPress={showDatePicker}>{dateTostring(date)}</Button>
        <Button onPress={incrementDate}>{">"}</Button>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      <FlatList
        data={data}
        renderItem={({ item }) => {
          return renderData(item);
        }}
        onRefresh={() => loadData()}
        refreshing={loading}
        keyExtractor={(item) => item.id}
      />

      <FAB
        style={styles.fab}
        small={false}
        icon="plus"
        theme={{ colors: { accent: "green" } }}
        onPress={() =>
          props.navigation.navigate("Create", { uidate: date.toJSON() })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardStyle: {
    margin: 10,
    padding: 10,
  },

  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
