import React, { Suspense } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Spinner,
} from "@chakra-ui/react";

// lazy load
const DaumPostcode = React.lazy(() => import("react-daum-postcode"));

export default function SearchAddressModal({ isOpen, onClose, onCompletePost }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size={"sm"}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>주소검색</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Suspense fallback={<Spinner />}>
                    <DaumPostcode onComplete={onCompletePost} />
                </Suspense>
            </ModalBody>
        </ModalContent>
    </Modal>
    );
}
