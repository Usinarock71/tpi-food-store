import { Card } from '@/shared/ui/Card';

interface ResumenCardProps {
  titulo: string;
  valor: string | number;
  acento?: string;
}

export function ResumenCard({ titulo, valor, acento = 'text-slate-900' }: ResumenCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className={`mt-2 text-3xl font-extrabold ${acento}`}>{valor}</p>
    </Card>
  );
}