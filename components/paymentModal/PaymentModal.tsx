import $api from '@/config/api/api';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { useState } from 'react';

export default function PaymentModal({ open, onClose, selectedPlan, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await $api.post('/plans/change-plan', {
        plan: selectedPlan?.title.includes('Год') ? 'enterprise' : 'premium',
      });

      if (response.data.confirmation_url) {
        window.location.href = response.data.confirmation_url;
      }
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      alert('Не удалось инициировать оплату. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* @ts-ignore */}
      <Modal isOpen={open} onOpenChange={onClose} aria-labelledby="modal-title">
        {/* @ts-ignore */}
        <ModalContent>
          <ModalHeader className="text-xl font-bold">Подтверждение оплаты</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="text-lg font-semibold">
                Вы выбрали тариф: <span className="font-bold">{selectedPlan?.title}</span>
              </div>
              <div className="text-lg">
                Стоимость: <span className="font-bold">{selectedPlan?.price}</span>
              </div>
              <div className="text-sm text-gray-600">Перейти к оплате?</div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" color="danger" onPress={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button color="primary" onPress={handlePayment} isLoading={loading}>
              Оплатить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
