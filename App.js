import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  FlatList, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: task, completed: false }]);
      setTask('');
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((item) => item.id !== taskId));
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
      setTasks(loadedTasks);
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
          <Text style={styles.addButtonText}>+</Text>
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
                <Text style={styles.updateButton}>✔</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity onPress={() => editTask(item.id, item.text)}>
                  <Text style={styles.editButton}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Text style={styles.deleteButton}>X</Text>
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
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
  editButton: {
    color: '#5C5CFF',
    fontSize: 24,
    marginRight: 10,
    color: '#000'
  },
  updateButton: {
    color: 'green',
    fontSize: 24,
    marginLeft: 10,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 24,
  },
});