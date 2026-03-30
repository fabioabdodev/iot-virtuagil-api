'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MapPinned, Thermometer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { DeviceSummary } from '@/types/device';
import { buildUniqueTechnicalId } from '@/lib/technical-id';
import { Feedback } from '@/components/ui/feedback';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';

const formSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Nome obrigatorio'),
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
    monitoringIntervalSeconds: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : undefined))
      .refine(
        (value) => value == null || (Number.isFinite(value) && value >= 10 && value <= 86400),
        {
          message: 'Cadencia invalida',
        },
      ),
    offlineAlertDelayMinutes: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : undefined))
      .refine(
        (value) => value == null || (Number.isFinite(value) && value >= 1 && value <= 10080),
        {
          message: 'Offline invalido',
        },
      ),
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
type DeviceFormOutput = {
  id: string;
  clientId?: string;
  name?: string;
  location?: string;
  minTemperature?: number;
  maxTemperature?: number;
  monitoringIntervalSeconds?: number;
  offlineAlertDelayMinutes?: number;
};

type DeviceFormProps = {
  mode: 'create' | 'edit';
  clientId?: string;
  device?: DeviceSummary | null;
  loading?: boolean;
  allowStructureFields?: boolean;
  allowTemperatureFields?: boolean;
  existingIds?: string[];
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
  existingIds = [],
  onSubmit,
  onCancel,
}: DeviceFormProps) {
  const [submitHint, setSubmitHint] = useState<string | null>(null);
  const [submitStateLabel, setSubmitStateLabel] = useState<string | null>(null);
  const {
    register,
    getValues,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      minTemperature: '',
      maxTemperature: '',
      monitoringIntervalSeconds: '',
      offlineAlertDelayMinutes: '',
    },
  });
  const watchedName = useWatch({
    control,
    name: 'name',
  });

  useEffect(() => {
    if (mode === 'edit' && device) {
      reset({
        name: device.name ?? '',
        location: device.location ?? '',
        minTemperature:
          device.minTemperature != null ? String(device.minTemperature) : '',
        maxTemperature:
          device.maxTemperature != null ? String(device.maxTemperature) : '',
        monitoringIntervalSeconds:
          device.monitoringIntervalSeconds != null
            ? String(device.monitoringIntervalSeconds)
            : '',
        offlineAlertDelayMinutes:
          device.offlineAlertDelayMinutes != null
            ? String(device.offlineAlertDelayMinutes)
            : '',
      });
      return;
    }

    reset({
      name: '',
      location: '',
      minTemperature: '',
      maxTemperature: '',
      monitoringIntervalSeconds: '',
      offlineAlertDelayMinutes: '',
    });
  }, [mode, device, reset]);

  async function submitDeviceForm() {
    const result = formSchema.safeParse(getValues());

    if (!result.success) {
      clearErrors();
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === 'string') {
          setError(fieldName as keyof DeviceFormValues, {
            type: 'manual',
            message: issue.message,
          });
        }
      }
      setSubmitStateLabel(null);
      setSubmitHint('Revise os campos destacados antes de continuar.');
      return;
    }

    clearErrors();
    setSubmitHint(null);
    setSubmitStateLabel('Enviando equipamento...');

    const parsed = result.data;
    const generatedId =
      mode === 'edit' && device
        ? device.id
        : buildUniqueTechnicalId(parsed.name, existingIds, {
            fallback: 'equipamento',
          });
    const nextValues = {
      id: generatedId,
      ...parsed,
      clientId: allowStructureFields
        ? clientId
        : undefined,
      name: allowStructureFields ? parsed.name : undefined,
      location: allowStructureFields ? parsed.location : undefined,
      minTemperature: allowTemperatureFields
        ? parsed.minTemperature
        : undefined,
      maxTemperature: allowTemperatureFields
        ? parsed.maxTemperature
        : undefined,
      monitoringIntervalSeconds: allowStructureFields
        ? parsed.monitoringIntervalSeconds
        : undefined,
      offlineAlertDelayMinutes: allowStructureFields
        ? parsed.offlineAlertDelayMinutes
        : undefined,
    };

    try {
      await onSubmit(nextValues);
      setSubmitStateLabel(null);
    } catch (error) {
      setSubmitStateLabel(null);
      setSubmitHint(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel concluir o cadastro do equipamento.',
      );
    }
  }

  const generatedIdPreview = buildUniqueTechnicalId(
    watchedName ?? '',
    existingIds,
    {
      fallback: 'equipamento',
    },
  );

  return (
    <div className="">
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
          {allowStructureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Nome</label>
              <Input {...register('name')} placeholder="Freezer Vacinas 01" />
              <p className="mt-1 text-xs text-muted">
                Use um nome claro para quem vai acompanhar a operacao no dia a dia.
              </p>
              <p className="mt-1 text-xs text-muted">
                Codigo tecnico gerado automaticamente: <strong>{generatedIdPreview}</strong>
              </p>
              {errors.name ? (
                <p className="mt-1 text-xs text-bad">
                  {errors.name.message}
                </p>
              ) : null}
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

          {allowStructureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">
                Cadencia (segundos)
              </label>
              <Input
                {...register('monitoringIntervalSeconds')}
                placeholder="vazio = herdar da conta"
              />
              <p className="mt-1 text-xs text-muted">
                Ex.: 30, 60, 300 ou 86400.
              </p>
              {errors.monitoringIntervalSeconds ? (
                <p className="mt-1 text-xs text-bad">
                  {errors.monitoringIntervalSeconds.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {allowStructureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">
                Offline (minutos)
              </label>
              <Input
                {...register('offlineAlertDelayMinutes')}
                placeholder="vazio = herdar da conta"
              />
              <p className="mt-1 text-xs text-muted">
                Quanto tempo o equipamento pode ficar sem leitura antes do alerta.
              </p>
              {errors.offlineAlertDelayMinutes ? (
                <p className="mt-1 text-xs text-bad">
                  {errors.offlineAlertDelayMinutes.message}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              void submitDeviceForm();
            }}
            className="inline-flex min-w-[168px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--accent))_0%,hsl(var(--accent-2))_100%)] px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 active:scale-[0.98] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Salvando...' : mode === 'create' ? 'Criar equipamento' : 'Salvar alteracoes'}
          </button>
        </div>
      </Panel>
    </div>
  );
}
