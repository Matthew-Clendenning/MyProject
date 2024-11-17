import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity, Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const addTask = () => {
    if (task.trim()) {
      const newTask = setTasks([...tasks, { id: Date.now().toString(), text: task, completed: false, fadeAnim: new Animated.Value(0) }]);
      setTask('');

      Animated.timing(newTask.fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find((item) => item.id === taskId);

    if (taskToDelete) {
      // Fade-out animation
      Animated.timing(taskToDelete.fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Remove task after fade-out
        setTasks(tasks.filter((item) => item.id !== taskId));
      });
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map((item) => {
      if (item.id === taskId) {
        return { ...item, completed: !item.completed };
      } else {
        return item;
      }
    }));
  };

  const editTask = (taskId, text) => {
    setEditingTaskId(taskId);
    setEditingText(text);
  };

  const updateTask = () => {
    if (editingText.trim()) {
      setTasks(tasks.map((item) => {
        if (item.id === editingTaskId) {
          return { ...item, text: editingText };
        } else {
          return item;
        }
      }));
    }
    setEditingTaskId(null);
    setEditingText('');
  };

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('tasks', jsonValue);
    } catch (e) {
      console.error('Error saving tasks:', e);
    }
  };

  const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('tasks');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Error loading tasks:', e);
      return [];
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const loadedTasks = await loadData();
      setTasks(loadedTasks.map(task => ({
        ...task,
        fadeAnim: new Animated.Value(1), // Set initial opacity for loaded tasks
      })));
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    storeData(tasks);
  }, [tasks]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Add a new task'
          placeholderTextColor='#999'
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Icon name="plus" size={18} color="#fff" />
          {/*<Text style={styles.addButtonText}>+</Text>*/}
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            {editingTaskId === item.id? (
              <TextInput
                style={styles.input}
                value={editingText}
                onChangeText={(text) => setEditingText(text)}
                onSubmitEditing={updateTask}
              />
            ) : (
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={styles.taskTextContainer}>
                <Text style={item.completed ? styles.completedTaskText : styles.taskText}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            {editingTaskId === item.id? (
              <TouchableOpacity onPress={updateTask}>
                <Icon name="check-circle" size={24} color="green" style={{ marginLeft: 10 }} />
                {/*<Text style={styles.updateButton}>✔</Text>*/}
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity onPress={() => editTask(item.id, item.text)}>
                  <Icon name="edit" size={24} color="#5C5CFF" style={{ marginRight: 10 }} />
                  {/*<Text style={styles.editButton}>✎</Text>*/}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Icon name="trash-o" size={24} color="#FF5C5C" />
                  {/*<Text style={styles.deleteButton}>X</Text>*/}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    fontSize: 16,
    color: '#aaa',
    textDecorationLine: 'line-through',
  },
});