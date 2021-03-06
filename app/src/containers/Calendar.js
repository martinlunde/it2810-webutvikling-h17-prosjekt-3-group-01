import React from 'react';
import { View, StyleSheet, AsyncStorage, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import {Week} from '../components/Calendar/Week';
import {AppointmentForm} from "../components/Calendar/AppointmentForm";
import {CalendarButton} from "../components/Calendar/CalendarButton";

export class Calendar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dateToday: new Date().toISOString().slice(0, 10),
            modalVisible: false,
            children: [],
        };

        //Binding functions
        this.createAppointment = this.createAppointment.bind(this);
        this.changeContent = this.changeContent.bind(this);
        this.setStorage = this.setStorage.bind(this);
        this.handleRemoveClick = this.handleRemoveClick.bind(this);
        this.loadData();
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    handleRemoveClick(uniqueDate){
        this.setState({tempUnique: uniqueDate});
    }

    emptyScheduleCheck(){
        //Copy of the state children array.
        let myData =[].concat(this.state.children)

        //Filtering out appointments on current day.
            .filter(child => child.date === this.state.dateToday)

        //Sorting elements based on time, earliest first.
            .sort((a, b) =>
                parseInt((("" + a.time.slice(0,2)) + a.time.slice(3,6)), 0) -
                parseInt(("" + b.time.slice(0,2)) + b.time.slice(3,6), 0))

            //Mapping items from array giving the html the correct values.
            .map((item,i) =>
                <View key={i}>
                    <TouchableOpacity onPress={() => {
                        this.handleRemoveClick(item.uniqueDate);
                        this.setModalVisible(true);
                        console.log(item.uniqueDate)}}
                        style={styles.showAppointments}>
                        <Text style={styles.appointmentItem}>{item.time}</Text>
                        <Text style={styles.appointmentItem}>{item.title}</Text>
                        <Text style={styles.appointmentItem}>{item.text}</Text>
                    </TouchableOpacity>
                </View>
            );

        //If there are no plans that day.
        if (myData.length === 0){
            myData = [  <View style={styles.showAppointments} key={0}>
                <Text style={styles.appointmentNoItems}>You don&#39;t have any plans!</Text>
            </View>];
        }

        return (
            <ScrollView style={styles.scrollView}>
                {myData}
            </ScrollView>
        );
    }

    changeContent(e){
        let data = this.state;
        data.dateToday = e.props.dateFull;
        this.setState({ dateToday: e.props.dateFull }, () => {
            this.setStorage(data);
        });
    }

    async loadData(){
        let data;
        try {
            data = await AsyncStorage.getItem('calendar');
            if (data !== null){
                data = JSON.parse(data);
                data.dateToday = new Date().toISOString().slice(0, 10);
                this.setState(data);
            } else{
                this.setState({
                    dateToday: new Date().toISOString().slice(0, 10),
                    children: [],
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    setStorage(data){
        try{
            AsyncStorage.setItem("calendar", JSON.stringify(data));
        } catch (error){
            console.log(error);
        }
    }

    createAppointment(e) {
        //Fetching values from form.
        let dateValue = e[0];
        let timeValue = e[1];
        let titleValue = e[2];
        let textValue = e[3];

        //Validate fields date, time and title. Last field is optional.
        if (this.validateFormDate(dateValue) && this.validateFormTime(timeValue) && this.validateFormTitle(titleValue)){

            //Creating new array with current state children.
            let newStateArray = this.state.children.slice();

            //Pushing new child to array.
            newStateArray.push({date: dateValue, time: timeValue, title: titleValue, text: textValue, uniqueDate: new Date()});

            //Sorting array with earliest appointments first.
            newStateArray.sort((a, b) =>
                parseInt((("" + a.time.slice(0,2)) + a.time.slice(3,6)), 0) -
                parseInt(("" + b.time.slice(0,2)) + b.time.slice(3,6), 0));

            //Creating new updated state.
            let data = {
                children: newStateArray,
                dateToday: new Date().toISOString().slice(0, 10),
            };

            //Setting state.
            this.setState({children: newStateArray,dateToday: new Date().toISOString().slice(0, 10)}, function(){
                //Setting updated values to storage.
                this.setStorage(data);
            });

        } else {
            //If there are invalid values.
            alert('Error! Do not submit invalid values.')
        }
    }

    validateFormDate(date){
        let lastDate = new Date();
        lastDate.setDate(lastDate.getDate() + 7);
        return date.length === 10 && date >= new Date().toISOString().slice(0, 10) && date < lastDate.toISOString().slice(0, 10);
    }

    validateFormTime(time){
        return (time.length === 5 && (parseInt(time.slice(3,6), 0) < 60)
                && (parseInt(time.slice(3,6), 0) >= 0) && (parseInt(time.slice(0,2), 0) < 25)
                && (parseInt(time.slice(0,2), 0) >= 0));
    }

    validateFormTitle(title){
        return (title.length > 0)
    }

    render(){
        return(
            <View style={styles.container}>
                <Week change={this.changeContent} />
                <View style={styles.bottomContainer}>
                    <AppointmentForm getValues={ arr => this.createAppointment(arr)} styles={this.styles} />
                    {this.emptyScheduleCheck()}
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={this.state.modalVisible}
                        onRequestClose={() => {alert("Form has been closed.")}}>
                        <View style={styles.formContainer}>
                            <CalendarButton
                                onpress={() => {
                                    this.setModalVisible(!this.state.modalVisible);
                                    let data = this.state.children;
                                    data = data.filter(a => String(a.uniqueDate) !== String(this.state.tempUnique));
                                    this.setState({children: data}, function() {
                                        this.setStorage(data);
                                        this.forceUpdate();
                                    });
                                }}
                                text={'Delete'}
                                backgroundC={'red'}/>
                            <CalendarButton
                                onpress={() => {
                                    this.setModalVisible(!this.state.modalVisible)
                                }}
                                text={'Cancel'}>
                            </CalendarButton>
                        </View>
                    </Modal>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        marginBottom: 20,
    },
    bottomContainer: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    showAppointments: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop:4,
        paddingBottom:7,
        paddingTop:7,
        marginBottom:4,
        borderBottomWidth:.5,
        borderBottomColor:'black',
    },
    appointmentItem: {
        flexBasis:'33%',
        textAlign:'center',
        fontSize:16,
        flexWrap: 'wrap',
    },
    appointmentNoItems: {
        marginTop: '10%',
        flexBasis:'90%',
        textAlign:'center',
        fontSize:20,
    },
    scrollView: {
        height: '100%',
    },
    formContainer: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
    },
});
