import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Animated,
} from 'react-native';
import axios from 'axios';

const ChatbotScreen = ({ userId, token }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current; // Animated value for scaling

  // Load Chat History from MongoDB
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get('http://<your-backend-url>/api/chat/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          setChatMessages(response.data.messages);
        } else {
          console.error('Failed to fetch chat history');
        }
      } catch (error) {
        console.error('Error fetching chat history:', error.message);
      }
    };

    fetchChatHistory();
  }, [token]);

  // Handle Send Message
  const sendMessage = async () => {
    if (currentMessage.trim() !== '') {
      const newMessage = { text: currentMessage, timestamp: new Date() };
      const updatedMessages = [...chatMessages, newMessage];
      setChatMessages(updatedMessages); // Update UI immediately

      try {
        await axios.post(
          'http://<your-backend-url>/api/chat/save',
          { message: currentMessage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error('Error saving message:', error.message);
      }

      setCurrentMessage(''); // Clear the input field
    }
  };

  // Animate the button when pressed
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHistory(!showHistory); // Toggle history visibility after animation
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Chatbot</Text>

      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        <FlatList
          data={chatMessages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.chatBubble}>
              <Text style={styles.chatText}>{item.text}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={currentMessage}
          onChangeText={setCurrentMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Chat History Toggle Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={styles.historyButton} onPress={animateButton}>
          <Text style={styles.historyButtonText}>
            {showHistory ? 'Hide Chat History' : 'Show Chat History'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004aad',
    padding: 20,
  },
  header: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  chatBubble: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    alignSelf: 'flex-start',
  },
  chatText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 10,
    marginLeft: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  historyButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
