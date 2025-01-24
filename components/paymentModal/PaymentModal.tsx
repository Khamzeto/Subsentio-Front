import { useTranslation } from 'react-i18next';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from '@nextui-org/react';
import { useState } from 'react';
import $api from '@/config/api/api';

export default function PaymentModal({ open, onClose, selectedPlan, initialLang }) {
  const { t } = useTranslation();
  console.log(selectedPlan.id, 'выбранный план');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [autoPaymentChecked, setAutoPaymentChecked] = useState(false);
  const [dataConsentChecked, setDataConsentChecked] = useState(false);

  // Определяем язык для Robokassa
  const language = ['ru', 'en'].includes(initialLang) ? initialLang : 'en';

  // Валидация: требуется согласие с офертой
  const isFormValid = dataConsentChecked;

  const handlePayment = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setErrorMessage('');
    try {
      // Определяем ID плана
      const planId = selectedPlan?.id;

      // Пример эндпоинта
      const endpoint = '/plans/change-plan';

      // Запрос на сервер с учетом языка оплаты
      const response = await $api.post(endpoint, {
        plan: planId,
        isRecurring: autoPaymentChecked,
        culture: language,
      });

      if (response.data.confirmation_url) {
        // Перенаправляем пользователя на оплату
        window.location.href = response.data.confirmation_url;
      }
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      setErrorMessage(t('paymentModal.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={onClose} aria-labelledby="modal-title">
      <ModalContent className="p-0 rounded-2xl w-[100%] max-w-[500px] mx-auto overflow-hidden">
        {/* Шапка */}
        <div className="w-full py-5 px-4 text-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
          <div className="text-5xl mb-2">👑</div>
          <h2 className="text-2xl font-extrabold text-white">
            {t('paymentModal.title')}
          </h2>
          <p className="text-gray-100 mt-1">{t('paymentModal.subtitle')}</p>
        </div>

        {/* Основная часть */}
        <div className="bg-white dark:bg-[#1a1a1a] px-6 py-4">
          <ModalBody className="space-y-4">
            {/* Цена */}
            <div className="text-center text-lg text-gray-700 dark:text-gray-300 font-medium">
              {t('paymentModal.priceDescription')}{' '}
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedPlan?.price}
              </span>
            </div>

            {/* Описание плана */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('paymentModal.planFeatures')}
            </div>

            {/* Чекбокс согласия с офертой */}
            {/* Чекбокс согласия с офертой */}
            <div className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-md">
              <input
                type="checkbox"
                id="dataConsent"
                className="mt-[2px] min-h-[16px] min-w-[16px] accent-purple-500 cursor-pointer"
                checked={dataConsentChecked}
                onChange={() => setDataConsentChecked(!dataConsentChecked)}
              />
              <label
                htmlFor="dataConsent"
                className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                {t('paymentModal.dataConsent.label')}{' '}
                <a
                  href={`https://subsentio.online${
                    language === 'ru' ? '/ru' : ''
                  }/public-offer`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-500 underline"
                >
                  {t('paymentModal.dataConsent.link')}
                </a>
                , {t('paymentModal.dataConsent.consent')}
              </label>
            </div>

            {/* Чекбокс автосписания */}
            <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-md">
              <input
                type="checkbox"
                id="autoPayment"
                className="min-h-[16px] min-w-[16px] accent-purple-500 cursor-pointer"
                checked={autoPaymentChecked}
                onChange={() => setAutoPaymentChecked(!autoPaymentChecked)}
              />
              <label
                htmlFor="autoPayment"
                className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                {t('paymentModal.autoPayment.label')}
              </label>
            </div>

            {/* Ошибка */}
            {errorMessage && (
              <div className="text-sm text-red-500 text-center">{errorMessage}</div>
            )}
          </ModalBody>
        </div>

        {/* Футер */}
        <div className="bg-white dark:bg-[#1a1a1a] px-6 pb-6">
          <ModalFooter className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Кнопка отмены */}
            <Button
              onPress={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-3 text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-[#2a2a2a] rounded-lg"
            >
              {t('paymentModal.buttons.cancel')}
            </Button>

            {/* Кнопка подтверждения */}
            <Button
              onPress={handlePayment}
              disabled={!isFormValid || loading}
              className={`w-full sm:w-auto px-4 py-3 rounded-lg ${
                loading
                  ? 'bg-purple-300 cursor-not-allowed text-white'
                  : isFormValid
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? <Spinner size="sm" /> : t('paymentModal.buttons.confirm')}
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
}
