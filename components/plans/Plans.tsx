'use client';
import { useEffect, useState } from 'react';
import { Card, Button } from '@nextui-org/react';
import { IconCheck } from '@tabler/icons-react';
import PaymentModal from '@/components/paymentModal/PaymentModal';
import { useTranslation } from 'react-i18next';

export default function PricingCards({ initialLang }: { initialLang: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== initialLang) {
      i18n.changeLanguage(initialLang); // Установка языка до рендера
    }
  }, [initialLang, i18n]);

  const plans = [
    {
      title: t('plans.basic'),
      price: t('plans.free'),
      features: [
        t('plans.personalDictionary'),
        t('plans.subtitlesAudioWords'),
        t('plans.unlimitedDualSubtitles'),
        t('plans.translationsOneClick'),
        t('plans.wordsSavingPerDay'),
      ],
      highlight: false,
      color: 'gray',
      buttonText: t('plans.activated'),
      buttonDisabled: true,
    },
    {
      title: t('plans.premiumMonth'),
      price: `199₽ / ${t('plans.month')}`,
      features: [
        t('plans.allBasicFeatures'),
        t('plans.unlimitedDualSubtitles'),
        t('plans.unlimitedTranslation'),
        t('plans.unlimitedSubtitleSaving'),
        t('plans.unlimitedWordTraining'),
      ],
      highlight: true,
      color: 'softBlue',
      buttonText: t('plans.upgradeToPremium'),
    },
    {
      title: t('plans.premiumYear'),
      price: `1299₽ / ${t('plans.year')}`,
      features: [
        t('plans.allBasicFeatures'),
        t('plans.unlimitedDualSubtitles'),
        t('plans.unlimitedTranslation'),
        t('plans.unlimitedSubtitleSaving'),
        t('plans.unlimitedWordTraining'),
      ],
      highlight: true,
      color: 'softGold',
      buttonText: t('plans.upgradeToPremium'),
    },
  ];

  const handlePlanSelect = plan => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    console.log(t('plans.paymentConfirmed'), selectedPlan.title);
    setModalOpen(false);
  };

  return (
    <>
      <div className="p-[30px] max-w-7xl mx-auto dark:bg-[#121212]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">{t('plans.choosePlan')}</h1>
          <p className="text-lg text-gray-500 mt-3 dark:text-gray-400">
            {t('plans.accessFeatures')}
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 max-xl:grid-cols-2 max-two:!grid-cols-1 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-6 border-2 min-h-[550px] rounded-[28px] flex flex-col justify-between ${
                plan.color === 'gray'
                  ? 'border-gray-200 dark:border-gray-700'
                  : plan.color === 'softBlue'
                  ? 'border-blue-300 dark:border-blue-500'
                  : 'border-yellow-300 dark:border-yellow-500'
              }`}
            >
              <div>
                <h2
                  className={`text-[18px] font-[600] mb-2 ${
                    plan.color === 'gray'
                      ? 'text-foreground'
                      : plan.color === 'softBlue'
                      ? 'text-blue-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {plan.title}
                </h2>
                <p
                  className={`text-3xl font-extrabold ${
                    plan.color === 'gray'
                      ? 'text-gray-800 dark:text-gray-100'
                      : plan.color === 'softBlue'
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}
                >
                  {plan.price}
                </p>
              </div>

              <ul className="space-y-4 my-8">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex  items-start justify-start text-left gap-[10px]"
                  >
                    <IconCheck
                      size={20}
                      style={{ minWidth: '20px' }}
                      className={`${
                        plan.color === 'gray'
                          ? 'text-green-500'
                          : plan.color === 'softBlue'
                          ? 'text-blue-500'
                          : 'text-yellow-500'
                      }`}
                    />
                    <span className="text-gray-900 dark:text-gray-400 text-left">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Button
                  variant="solid"
                  className={`w-full ${
                    plan.color === 'gray'
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200'
                      : plan.color === 'softBlue'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-yellow-500 text-black hover:bg-yellow-600'
                  }`}
                  disabled={plan.buttonDisabled}
                  onPress={() => handlePlanSelect(plan)}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Модальное окно */}
      {selectedPlan && (
        <PaymentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedPlan={selectedPlan}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );
}
