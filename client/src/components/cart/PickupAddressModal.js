import React, { useState } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
    Input, Checkbox, Button, Box, Text, Image, VStack, HStack, Spacer
} from '@chakra-ui/react';

export default function PickupAddressModal({ isOpen, onClose, onComplete }) {
    const [sido, setSido] = useState('');
    const [roadName, setRoadName] = useState('');
    const [saveAddress, setSaveAddress] = useState(true);
    const [selectedFarm, setSelectedFarm] = useState(null);

    const farms = [
        { id: 1, name: '직매장A', distance: '~2km', tel: '010-1234-5678', unmanned: true },
        { id: 2, name: '농가B', distance: '~3.5km', tel: '010-2222-3333', unmanned: false },
        { id: 3, name: '직매장C', distance: '~4.1km', tel: '010-9876-5432', unmanned: true },
    ];

    const handleConfirm = () => {
        if (!selectedFarm) {
        alert('직매장을 선택해주세요.');
        return;
    }
    const fullAddress = `${sido} ${roadName}`;
        onComplete?.({ address: fullAddress, farm: selectedFarm });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
            <ModalOverlay bg="rgba(255,255,255,0.6)"/>
                <ModalContent borderRadius="md" maxW="420px" w="100%" p={0} >
                    <ModalHeader fontWeight="bold" fontSize="lg" px={6} pt={6}>주소 찾기</ModalHeader>
                    <ModalCloseButton 
                        position="absolute"
                        top="10px"
                        right="10px"
                        size="sm"
                        _hover={{ bg: "gray.200" }}/>
                    <ModalBody px={6} pb={6} pt={0}>
                    <VStack spacing={3} align="stretch">
                        <Text fontSize="sm" color="gray.600">
                            가까운 직매장을 찾아드려요
                        </Text>

                        <Input
                            placeholder="시/도"
                            value={sido}
                            onChange={(e) => setSido(e.target.value)}
                            bg="white"
                        />
                        <Input
                            placeholder="도로명"
                            value={roadName}
                            onChange={(e) => setRoadName(e.target.value)}
                            bg="white"
                        />

                        <Checkbox isChecked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)}>     
                            주소 저장
                        </Checkbox>
                        <Text fontSize="xs" color="gray.500" ml={6}>
                            다음 번에도 이 주소로 이용할게요
                        </Text>

                        <Button
                            bg="black"
                            color="white"
                            _hover={{ bg: 'gray.700' }}
                            size="md"
                            mt={2}
                        >
                            가까운 직매장 / 농가 찾기
                        </Button>

                        <Box mt={4}>
                            {farms.map(farm => (
                                <HStack key={farm.id} p={3} spacing={4} borderBottom="1px solid #eee" align="center">
                                    <Box
                                        w="48px"
                                        h="48px"
                                        bg="gray.300"
                                        borderRadius="md"
                                        backgroundImage="url('https://via.placeholder.com/48')"
                                        backgroundSize="cover"
                                        backgroundPosition="center"
                                    />
                                    <Box flex="1">
                                        <Text fontWeight="semibold">{farm.name}</Text>
                                        <Text fontSize="xs" color="gray.500">거리: {farm.distance}</Text>
                                        <Text fontSize="xs" color="gray.500">전화번호: {farm.tel}</Text>
                                        {farm.unmanned && (
                                            <Text fontSize="xs" color="green.500">무인 수령함 사용 가능</Text>
                                        )}
                                    </Box>
                                    <Button
                                        size="sm"
                                        colorScheme={selectedFarm?.id === farm.id ? 'green' : 'gray'}
                                        onClick={() => setSelectedFarm(farm)}
                                    >
                                        {selectedFarm?.id === farm.id ? '선택됨' : '선택'}
                                    </Button>
                                </HStack>
                            ))}
                        </Box>

                        <Button
                            colorScheme="blue"
                            mt={4}
                            width="100%"
                            onClick={handleConfirm}
                        >
                            주소 및 직매장 선택 완료
                        </Button>
                </VStack>
            </ModalBody>
        </ModalContent>
    </Modal>
    );
}
