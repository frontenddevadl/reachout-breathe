import React from "react";
import { Alert, Button, FlatList, Text,  TimePickerAndroid, View } from "react-native";
import { Localization } from "expo";
import moment from "moment";

import calendarService from '../../services/calendarService';

export default class ReminderSettingsScreen extends React.Component {
  calendarService;
  breatheCalendar = undefined;

  state = {
    events: []
  };

  static navigationOptions = {
    title: "Breathing Intervals"
  };

  constructor(props) {
    super(props);
    this.calendarService = new calendarService("Breathe", "Reachout");
  }
  
  from() {
    return moment().startOf('day').toDate();
  }

  to() {
    return moment().add(1, "y").endOf("day").toDate();
  }

  async componentDidMount() {
    await this.calendarService.initialize();

    this.setState({
      events: await this.calendarService.getEvents(
        this.from(),
        this.to()
      )
    });
  }

  addEvent = async (hours, minutes) => {
    const startDate = moment();
    startDate.hours(hours);
    startDate.minutes(minutes);
    startDate.seconds(0);

    const endDate = new moment(startDate).add(20, 'minutes');

    await this.calendarService.addEvent({
      title: "Breathe",
      location: "",
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      timeZone: Localization.timezone || undefined,
    });
  
    this.setState({
      events: await this.calendarService.getEvents(this.from(), this.to())
    });
  }

  timeDialog = async () => {
    try {
      const now = moment();
      const { action, hour, minute } = await TimePickerAndroid.open({
        hour: now.hours,
        minute: now.minutes,
        is24Hour: false,
        mode: 'spinner'
      });
      
      if (action !== TimePickerAndroid.dismissedAction) {
        this.addEvent(hour, minute)
      }
    } catch ({ code, message }) {
      console.warn('Cannot open time picker', message);
    }
  }

  confirmDelete(item) {
    console.log(item.id);
    Alert.alert(
      'Delete Reminder',
      `${this.formatDate(item.startDate)}`,
      [
        {text: 'Cancel', onPress: () => {}},
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      { cancelable: false }
    )
  }
  
  getRenderItemKey = (item) => item.instanceId;
  formatDate = date => moment(date).format("DD/MMM/YYYY hh:mm A");

  render() {
    return ( <View >
      <Button onPress = {this.timeDialog} title = "New Reminder"/>
      <FlatList data = {this.state.events}
                keyExtractor = {this.getRenderItemKey}
                renderItem = {
                  ({ item }) => ( <Text onPress={() => this.confirmDelete(item)}> {this.formatDate(item.startDate)} </Text>)
              }    
      />
      </View>
    );
  }
}