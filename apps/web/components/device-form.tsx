'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DeviceSummary } from '@/types/device';
import { Button } from '@/components/ui/button';
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

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const parsed = formSchema.parse(values);
        const nextValues = {
          ...parsed,
          clientId: allowStructureFields ? parsed.clientId : undefined,
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
      })}
      className=""
    >
      <Panel variant="strong" className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-ink">
            {mode === 'create' ? 'Novo device' : `Editar ${device?.id ?? ''}`}
          </h3>
          {onCancel ? (
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              Fechar
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted">ID</label>
            <Input
              {...register('id')}
              disabled={mode === 'edit'}
              placeholder="freezer_01"
            />
            {errors.id ? (
              <p className="mt-1 text-xs text-bad">{errors.id.message}</p>
            ) : null}
          </div>

          {allowStructureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">clientId</label>
              <Input {...register('clientId')} placeholder="cliente_a" />
              {errors.clientId ? (
                <p className="mt-1 text-xs text-bad">{errors.clientId.message}</p>
              ) : null}
            </div>
          ) : null}

          {allowStructureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Nome</label>
              <Input {...register('name')} placeholder="Freezer Loja" />
            </div>
          ) : null}

          {allowStructureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Localizacao</label>
              <Input {...register('location')} placeholder="Camara fria" />
            </div>
          ) : null}

          {allowTemperatureFields ? (
            <div>
              <label className="mb-1 block text-xs text-muted">Min temp (C)</label>
              <Input {...register('minTemperature')} placeholder="-20" />
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
              {errors.maxTemperature ? (
                <p className="mt-1 text-xs text-bad">
                  {errors.maxTemperature.message}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
            className="min-w-[168px]"
          >
            {loading
              ? 'Salvando...'
              : mode === 'create'
                ? 'Criar device'
                : 'Salvar alteracoes'}
          </Button>
        </div>
      </Panel>
    </form>
  );
}
