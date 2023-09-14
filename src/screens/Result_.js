import React, { useState,  useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const Result_ = ({ route }) => {
    const navigation = useNavigation();
    const { historyId} = route.params;
    const [histories, setHistories] = useState([]);
    const { bookmarked, updateBookmark } = route.params;

    useEffect(() => {
        fetch(`http://192.168.0.104:8000/home/history/${historyId}/`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('네트워크 오류');
                }
                return response.json();
            })
            .then((data) => setHistories(data.result))
            .catch((error) => console.error('요청 에러: ', error));
    }, [historyId]);

    if (!histories) {
        return <Text>Loading...</Text>;
    }

    const getImage = (imagePath) => {
        try {
            return `http://192.168.0.104:8000${imagePath}`;
        } catch (error) {
            console.error('이미지 URL을 가져오는 중 오류 발생:', error);
        }
    };

    const [isBookmarked, setIsBookmarked] = useState(bookmarked);

    const itemRenderer = ({ item }) => {
        const date = new Date(item.created_at);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
            const formattedDate = `Date: ${year}-${month}-${day} ${hours}:${minutes}`;
            
            return (
            <TouchableOpacity
                style={styles.magazineItem}
                onPress={() => handleRecord(item)}
            >
                <View style={styles.imageContainer}>
                <Image source={{ uri: getImage(item.history_img) }} style={styles.image} />
                <Text style={styles.smallTitle}>{item.name}</Text>
                <View style={styles.dateContainer}>
                    <View style={styles.dateBackground}></View>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                </View>
                </View>
            </TouchableOpacity>
            );
        };

    useEffect(() => {
        setIsBookmarked(bookmarked);
    }, [bookmarked]);
    

    const toggleBookmark = () => {
        const updatedBookmark = !isBookmarked;
        setIsBookmarked(updatedBookmark);
        updateBookmark({ id: route.params.id, bookmarked: updatedBookmark });
    };


    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={30} color="#2D5E40" />
                </TouchableOpacity>
                <Text style={styles.title}>{histories.name}</Text>
                <Image source={{uri: getImage(histories.history_img)}} style={styles.image} />
                <View style={styles.infoContainer}>
                    <Text style={styles.date}>{histories.formattedDate}</Text>
                    <View style={styles.bookmarkContainer}>
                        <Text style={styles.bookmarkText}>Bookmarked: </Text>
                        <TouchableOpacity onPress={toggleBookmark}>
                            <Icon
                                name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                                size={24}
                                color={isBookmarked ? 'blue' : 'gray'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.explanation}>{histories.causation}</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 25,
        zIndex: 1,
        right: 30,
    },
    title: {
        fontSize: 30,
        color: '#8CB972',
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 40,
    },
    image: {
        width: '90%',
        height: 250,
        borderRadius: 10,
        marginVertical: 20,
    },
    explanation: {
        fontSize: 16,
        backgroundColor: '#E5EFDF',
        borderRadius: 10,
        color: '#2D5E40',
        borderWidth: 1,
        borderColor: '#2D5E40',
        padding: 20,
        width: '90%',
    },
    infoContainer: {
        alignItems: 'flex-start',
        margin: 10,
        left: "-20%",
        marginBottom: 20,
    },
    bookmarkContainer: {
        flexDirection: 'row',
    },
    bookmarkText: { // 북마크 텍스트 스타일 추가
        fontSize: 16,
    },
});

export default Result_;



