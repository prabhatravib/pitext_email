import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { motion } from 'motion/react';
import { useEffect } from 'react';

export default function HomeContent() {
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  return (
    <main className="relative flex h-full flex-1 flex-col overflow-x-hidden bg-[#0F0F0F] px-2">
      <section className="z-10 mt-32 flex flex-col items-center px-4">
        {/* Get Started button - redirect to Gmail connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-6"
        >
          <Button
            onClick={() => {
              navigate('/settings/connections');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Connect Gmail & Get Started
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
