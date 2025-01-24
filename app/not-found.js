'use client';

import { Button, Card } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#121212]">
      <Card className="text-center p-10 shadow-lg rounded-[20px]">
        {/* Эмодзи */}
        <div className="text-6xl mb-4">😕</div>
        {/* Заголовок */}
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">404</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          The page you’re looking for doesn’t exist.
        </p>
        {/* Кнопка возврата */}
        <Button
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => router.back()}
          auto
        >
          Go Back
        </Button>
      </Card>
    </div>
  );
}
