import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardTypes, ReturnKeyTypes } from '../components/Input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DjangoIP from '../components/SetIP';
import Pw_reset from './screensMypage/Pw_reset';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Pw_find = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false); // 이메일이 전송되었는지 여부
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeValid, setIsCodeValid] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        const getToken = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('authToken');
                if (accessToken !== null) {
                    console.log('토큰을 성공적으로 가져왔습니다:', accessToken);
                    setToken(accessToken);
            
                } else {
                    console.error('authToken이 없음!!');
                }
            } catch (error) {
                console.error('토큰 에러 : ', error);
            }
        };
        getToken();

    }, []);

    const isEmailValid = email => {
        const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailPattern.test(email);
    };

    const handleSendResetEmail = () => {
        if (isEmailValid(email)) {
            
            fetch(`${DjangoIP}accounts/send_email/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: email,
                }),                                       
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === '이메일이 전송되었습니다.') {
                    setIsEmailSent(true); // 이메일 전송 후에 상태를 true로 변경
                } else {
                    Alert.alert('경고', data.message, [{text: '확인'}]);
                }
            })
            .catch(error => {
                console.error('에러 발생: ', error);
                Alert.alert('에러', '서버에 요청을 보내는 중 문제가 발생했습니다.', [
                    {text: '확인'},
                ]);
            });
        } else {
            Alert.alert('경고', '이메일 주소를 확인해주세요.', [{ text: '확인' }]);
        }
    };

    const handleVerifyCode = () => {
        if (verificationCode) {
            try {
                fetch(`${DjangoIP}/accounts/check_auth_code/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        email: email,
                        auth_code: verificationCode,
                    }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('네트워크가 아니래');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    if (data.status === 200) {
                        console.log(data);
                        setIsCodeValid(true);
                        Alert.alert('인증되었습니다.', '새 비밀번호를 설정해주세요!');

                        if (token) {
                            AsyncStorage.setItem('authToken', token); // AsyncStorage에 저장
                            navigation.navigate('Pw_reset', { token: token, email});
    
                        } else {
                            console.error('토큰이 정의되지 않았습니다.');
                        }
                    } else {
                        //console.log(data.status);
                        setIsCodeValid(false);
                        Alert.alert('경고', '인증 코드가 일치하지 않습니다.', [{text: '확인'}]);
                    }
                })
                .catch(error => {
                    console.error('에러발생: ', error);
                    Alert.alert('에러', '서버에 요청을 보내는 중 문제가 발생했습니다.', [
                        {text: '확인'},
                    ]);
                });
            } catch (error) {
                console.error('에러발생: ', error);
                Alert.alert('에러', '서버 요청 중에 오류가 발생했습니다.', [
                    {text: '확인'},
                ]);
            }
        }
    }

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/main.png')}
                style={[styles.image, { opacity: 0.5 }]}
            ></Image>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={30} color="#2D5E40" />
            </TouchableOpacity>
            <Text style={styles.baseText}>GreenDan</Text>
            {!isEmailSent ? (
                <>
                    <TextInput
                        title={'이메일'}
                        style={styles.input}
                        placeholder="your@mail.com"
                        keyboardType={KeyboardTypes.EMAIL}
                        returnKeyType={ReturnKeyTypes.GO}
                        value={email}
                        onChangeText={text => setEmail(text)}
                    />

                    <TouchableOpacity onPress={handleSendResetEmail}>
                        <Text style={styles.textButton}>
                            비밀번호 찾기
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.text}>
                        이메일이 전송되었습니다. 이메일을 확인하여 비밀번호 재설정을 완료하세요.
                    </Text>
                    {/* 이메일 전송 후, 인증 코드 입력 필드 */}
                    <TextInput
                        title={'인증 코드'}
                        style={styles.input}
                        placeholder="인증 코드 입력"
                        keyboardType={KeyboardTypes.NUMBER}
                        returnKeyType={ReturnKeyTypes.GO}
                        value={verificationCode}
                        onChangeText={text => setVerificationCode(text)}
                    />
                    <TouchableOpacity onPress={handleVerifyCode}>
                        <Text style={styles.textButton}>
                            확인
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginVertical: 150,
        margin: 10,
        padding: 10,
        borderRadius: 10,
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 10,
    },
    baseText: {
        flex: 1,
        fontSize: 30,
        color: '#8CB972',
        fontWeight: 'bold',
        margin: 20,
    },
    text: {
        fontSize: 20,
    },
    image: {
        borderRadius: 1,
    },
    textButton: {
        fontSize: 20,
        fontWeight: 'bold',
        borderRadius: 10,
        borderColor: '#2D5E40',
        borderWidth: 1,
        paddingHorizontal: 80,
        paddingVertical: 7,
        margin: 10,
        backgroundColor: '#2D5E40',
        color: '#E5EFDF',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        width: '80%',
        borderRadius: 10,
        backgroundColor: '#E5EFDF',
        color: '#538454',
        borderColor: '#2D5E40',
    },
    backButton: {
        position: 'absolute',
        top: -100,
        left: 280,
        padding: 10,
    },
    styles_text: {
        
    }
});

export default Pw_find;