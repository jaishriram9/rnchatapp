import {View, Text, StyleSheet} from 'react-native';
import React, {useState, useCallback, useEffect} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import {useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const route = useRoute();

  useEffect(() => {
    const subscriber = firestore()
      .collection('chats')
      .doc(route.params.id + route.params.data.userId)
      .collection('messages')
      .orderBy('createdAt', 'desc');

    subscriber.onSnapshot(querysnapshot => {
      const allmessages = querysnapshot.docs.map(item => {
        return {...item._data, createdAt: item._data.createdAt};
      });
      setMessageList(allmessages);
    });

    return subscriber;
  }, []);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);

  const onSend = useCallback((messages = []) => {
    let tempMsg = messages[0];
    const msg = {
      ...tempMsg,
      sendBy: route.params.selfId,
      sendTo: route.params.data.user.userId,
      createdAt: Date.parse(tempMsg.createdAt),
    };

    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    );

    {
      /********for sender to know **************/
    }
    firestore()
      .collection('chats')
      .doc('' + route.params.id + route.params.data.user.userId)
      .collection('messages')
      .add(msg);

    {
      /*********for receiver to know ********************/
    }

    firestore()
      .collection('chats')
      .doc('' + route.params.data.user.userId + route.params.id)
      .collection('messages')
      .add(msg);
  }, []);

  return (
    <View style={styles.chatContainer}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: route.params.selfId,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
  },
});

export default ChatScreen;
