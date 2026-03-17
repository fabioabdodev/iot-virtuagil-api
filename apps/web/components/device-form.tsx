'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MapPinned, Thermometer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DeviceSummary } from '@/types/device';
import { Feedback } from '@/components/ui/feedback';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';

const deviceIdRegex = /^[a-zA-Z0-9_-]{3,50}$/;

const formSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(3, 'ID deve ter pelo menos 3 caracteres')
      .max(50, 'ID deve ter no maximo 50 caracteres')
      .regex(deviceIdRegex, 'Use apenas letras, numeros, _ e -'),
    clientId: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined))
      .refine((value) => !value || deviceIdRegex.test(value), {
        message: 'clientId invalido',
      }),
    name: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined)),
    location: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined)),
    minTemperature: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : undefined))
      .refine((value) => value == null || Number.isFinite(value), {
        message: 'Minimo invalido',
      }),
    maxTemperature: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : undefined))
      .refine((value) => value == null || Number.isFinite(value), {
        message: 'Maximo invalido',
      }),
  })
  .refine(
    (values) =>
      values.minTemperature == null ||
      values.maxTemperature == null ||
      values.minTemperature <= values.maxTemperature,
    {
      message: 'Minimo deve ser menor ou igual ao maximo',
      path: ['maxTemperature'],
    },
  );

type DeviceFormValues = z.input<typeof formSchema>;
type DeviceFormOutput = z.output<typeof formSchema>;

type DeviceFormProps = {
  mode: 'create' | 'edit';
  clientId?: string;
  device?: DeviceSummary | null;
  loading?: boolean;
  allowStructureFields?: boolean;
  allowTemperatureFields?: boolean;
  onSubmit: (values: DeviceFormOutput) => void | Promise<void>;
  onCancel?: () => void;
};

export function DeviceForm({
  mode,
  clientId,
  device,
  loading,
  allowStructureFields = true,
  allowTemperatureFields = true,
  onSubmit,
  onCancel,
}: DeviceFormProps) {
  const hasScopedClient = Boolean(clientId);
  const [submitHint, setSubmitHint] = useState<string | null>(null);
  const [submitStateLabel, setSubmitStateLabel] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      clientId: clientId ?? '',
      name: '',
      location: '',
      minTemperature: '',
      maxTemperature: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && device) {
      reset({
        id: device.id,
        clientId: device.clientId ?? clientId ?? '',
        name: device.name ?? '',
        location: device.location ?? '',
        minTemperature:
          device.minTemperature != null ? String(device.minTemperature) : '',
        maxTemperature:
          device.maxTemperature != null ? String(device.maxTemperature) : '',
      });
      return;
    }

    reset({
      id: '',
      clientId: clientId ?? '',
      name: '',
      location: '',
      minTemperature: '',
      maxTemperature: '',
    });
  }, [mode, device, clientId, reset]);

  const submitDeviceForm = handleSubmit(
    async (values) => {
      setSubmitHint(null);
      setSubmitStateLabel('Enviando equipamento...');
      const parsed = formSchema.parse(values);
      const nextValues = {
        ...parsed,
        clientId: allowStructureFields
          ? parsed.clientId ?? clientId
          : undefined,
        name: allowStructureFields ? parsed.name : undefined,
        location: allowStructureFields ? parsed.location : undefined,
        minTemperature: allowTemperatureFields
          ? parsed.minTemperature
          : undefined,
        maxTemperature: allowTemperatureFields
          ? parsed.maxTemperature
          : undefined,
      };

      await onSubmit(nextValues);
      setSubmitStateLabel(null);
    },
    () => {
      setSubmitStateLabel(null);
      setSubmitHint('Revise os campos destacados antes de continuar.');
    },
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submitDeviceForm();
      }}
      className=""
    >
      <Panel variant="strong" className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-ink">
            {mode === 'create' ? 'Novo equipamento' : `Editar ${device?.id ?? ''}`}
          </h3>
          {onCancel ? (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-line/70 bg-card/70 px-3 py-2 text-xs font-semibold text-ink transition hover:border-accent/40 hover:bg-card"
              onClick={onCancel}
            >
              Fechar
            </button>
          ) : null}
        </div>

        {submitStateLabel ? (
          <Feedback className="mb-4">{submitStateLabel}</Feedback>
        ) : null}
        {submitHint ? (
          <Feedback variant="danger" className="mb-4">
            {submitHint}
          </Feedback>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted">ID unico</label>
            <Input
              {...register('id')}
              disabled={mode === 'edit'}
              placeholder="freezer_vacinas_01"
            />
            <p className="mt-1 text-xs text-muted">
              Identificador tecnico unico do equipamento.
            </p>
            {errors.id ? (
              <p className="mt-1 text-xs text-bad">{errors.id.message}</p>
            ) : null}
          </div>

          {allowStructureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Codigo interno do cliente</label>
              <Input
                {...register('clientId')}
                placeholder="cuidare-vacinas"
                readOnly={hasScopedClient}
                aria-readonly={hasScopedClient}
              />
              {hasScopedClient ? (
                <p className="mt-1 text-xs text-muted">
                  Definido pela conta selecionada no painel.
                </p>
              ) : null}
              {errors.clientId ? (
                <p className="mt-1 text-xs text-bad">{errors.clientId.message}</p>
              ) : null}
            </div>
          ) : null}

          {allowStructureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Nome</label>
              <Input {...register('name')} placeholder="Freezer Vacinas 01" />
              <p className="mt-1 text-xs text-muted">
                Use um nome claro para quem vai acompanhar a operacao no dia a dia.
              </p>
            </div>
          ) : null}

          {allowStructureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Localizacao</label>
              <Input {...register('location')} placeholder="Camara fria" />
              <p className="mt-1 text-xs text-muted">
                Ex.: sala de armazenamento, recepcao ou camara fria.
              </p>
            </div>
          ) : null}

          {allowTemperatureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Min temp (C)</label>
              <Input {...register('minTemperature')} placeholder="-20" />
              <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Thermometer className="h-3.5 w-3.5" />
                Valor minimo esperado para operacao segura.
              </div>
              {errors.minTemperature ? (
                <p className="mt-1 text-xs text-bad">
                  {errors.minTemperature.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {allowTemperatureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Max temp (C)</label>
              <Input {...register('maxTemperature')} placeholder="-10" />
              <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                <MapPinned className="h-3.5 w-3.5" />
                Ajuste com base na rotina real do cliente.
              </div>
              {errors.maxTemperature ? (
                <p className="mt-1 text-xs text-bad">
                  {errors.maxTemperature.message}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-w-[168px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--accent))_0%,hsl(var(--accent-2))_100%)] px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 active:scale-[0.98] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Salvando...' : mode === 'create' ? 'Criar equipamento' : 'Salvar alteracoes'}
          </button>
        </div>
      </Panel>
    </form>
  );
}
