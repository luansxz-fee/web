import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  Medication,
  DoseLog,
  TodayMedicationItem,
} from '../types';

import { api } from '../services/api';

export interface MedContextData {
  medications: Medication[];

  logs: DoseLog[];

  adherence: {
    dias7: number;
    dias30: number;
  };

  addMedication: (
    data: Omit<Medication, 'id'> & {
      id?: string;
      _id?: string;
    }
  ) => Promise<void>;

  updateMedication: (
    id: string,
    data: Partial<Medication>
  ) => Promise<void>;

  toggleMedication: (
    id: string
  ) => Promise<void>;

  deleteMedication: (
    id: string
  ) => Promise<void>;

  logDose: (
    medicationId: string,
    time: string,
    status: string,
    notes?: string
  ) => Promise<void>;

  getTodayMedications:
    () => TodayMedicationItem[];

  getUpcomingDoses:
    () => {
      medication: Medication;
      time: string;
    }[];

  getAdherenceRate: (
    days: number
  ) => number;

  fetchMedications:
    () => Promise<void>;

  fetchAdherence:
    () => Promise<void>;
}

export const MedContext =
  createContext<MedContextData>(
    {} as MedContextData
  );

/*
 * =========================================================
 * UTILITÁRIOS DE SESSÃO
 * =========================================================
 */

function obterUsuarioId(): string | null {
  try {
    const usuarioSalvo =
      localStorage.getItem(
        'medsync_usuario'
      );

    if (usuarioSalvo) {
      const usuario =
        JSON.parse(usuarioSalvo);

      if (usuario?.id) {
        return String(usuario.id);
      }
    }

    /*
     * Fallback:
     * se não houver usuário salvo,
     * consulta o backend.
     *
     * O ID também pode ser obtido do JWT,
     * mas não precisamos fazer isso aqui.
     */
    return null;
  } catch {
    return null;
  }
}

function getStorageKey(
  tipo: 'meds' | 'logs'
): string | null {
  const usuarioId =
    obterUsuarioId();

  if (!usuarioId) {
    return null;
  }

  return `@medapp:${usuarioId}:${tipo}`;
}

function limparCacheDoUsuarioAtual() {
  const medsKey =
    getStorageKey('meds');

  const logsKey =
    getStorageKey('logs');

  if (medsKey) {
    localStorage.removeItem(
      medsKey
    );
  }

  if (logsKey) {
    localStorage.removeItem(
      logsKey
    );
  }
}

/*
 * =========================================================
 * DATAS / HORÁRIOS
 * =========================================================
 */

const getTodayString = () => {
  const d = new Date();

  const year =
    d.getFullYear();

  const month = String(
    d.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    d.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const normalizeDate = (
  d?: any
): string => {
  if (!d) {
    return getTodayString();
  }

  const str =
    String(d).trim();

  if (str.includes('T')) {
    return str.split('T')[0];
  }

  return str.slice(0, 10);
};

const normalizeTime = (
  t?: any
): string => {
  if (!t) {
    return '';
  }

  return String(t)
    .trim()
    .slice(0, 5);
};

const isTimePassed = (
  timeStr: string
) => {
  const normalized =
    normalizeTime(timeStr);

  if (!normalized) {
    return false;
  }

  const [h, m] =
    normalized
      .split(':')
      .map(Number);

  if (
    Number.isNaN(h) ||
    Number.isNaN(m)
  ) {
    return false;
  }

  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  const scheduledMinutes =
    h * 60 + m;

  return (
    currentMinutes >
    scheduledMinutes
  );
};

/*
 * =========================================================
 * PROVIDER
 * =========================================================
 */

export const MedProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [medications, setMedications] =
    useState<Medication[]>([]);

  const [logs, setLogs] =
    useState<DoseLog[]>([]);

  const [adherence, setAdherence] =
    useState<{
      dias7: number;
      dias30: number;
    }>({
      dias7: 100,
      dias30: 100,
    });

  /*
   * Carrega o cache SOMENTE do usuário atual.
   */
  const carregarCache =
    useCallback(() => {
      const medsKey =
        getStorageKey('meds');

      const logsKey =
        getStorageKey('logs');

      try {
        if (medsKey) {
          const saved =
            localStorage.getItem(
              medsKey
            );

          setMedications(
            saved
              ? JSON.parse(saved)
              : []
          );
        } else {
          setMedications([]);
        }

        if (logsKey) {
          const saved =
            localStorage.getItem(
              logsKey
            );

          setLogs(
            saved
              ? JSON.parse(saved)
              : []
          );
        } else {
          setLogs([]);
        }
      } catch {
        setMedications([]);
        setLogs([]);
      }
    }, []);

  /*
   * =======================================================
   * FORMATADORES
   * =======================================================
   */

  const formatMed = (
    item: any
  ): Medication => {
    const realId = String(
      item.id ||
        item._id ||
        ''
    ).trim();

    return {
      id: realId,

      _id: realId,

      name:
        item.nome ||
        item.name ||
        '',

      dosage:
        item.dosagem ||
        item.dosage ||
        '',

      unit:
        item.unidade ||
        item.unit ||
        'mg',

      frequency:
        item.frequencia ||
        item.frequency ||
        'Diário',

      times:
        item.horarios ||
        item.times ||
        [],

      stock: Number(
        item.estoqueAtual ??
          item.estoque ??
          item.stock ??
          0
      ),

      stockMax: Number(
        item.estoqueMaximo ??
          item.stockMax ??
          30
      ),

      active:
        item.ativo ??
        item.active ??
        true,

      color:
        item.cor ||
        item.color ||
        '#3b82f6',

      category:
        item.categoria ||
        item.category ||
        'Geral',

      icon:
        item.icone ||
        item.icon ||
        'Pill',

      imageUrl:
        item.urlImagem ||
        item.imageUrl ||
        item.imagemUrl,

      prescribedBy:
        item.medicoPrescritor ||
        item.medico ||
        item.prescribedBy,

      startDate:
        item.dataInicio ||
        item.startDate ||
        getTodayString(),

      endDate:
        item.dataTermino ||
        item.endDate,

      reminderEnabled:
        item.lembreteAtivo ??
        item.reminderEnabled ??
        true,

      instructions:
        item.instrucoes ||
        item.instructions,

      sideEffects:
        item.efeitosColaterais ||
        item.sideEffects,
    };
  };

  const parseLog = (
    l: any
  ): DoseLog => {
    const rawStatus =
      String(
        l.situacao ||
          l.status ||
          ''
      )
        .toUpperCase()
        .trim();

    const isTaken = [
      'TOMADO',
      'TAKEN',
      'CONCLUIDO',
      'OK',
      'TRUE',
    ].includes(rawStatus);

    const isMissed = [
      'PERDIDO',
      'MISSED',
      'ATRASADO',
    ].includes(rawStatus);

    const frontendStatus:
      | 'taken'
      | 'skipped'
      | 'missed' =
      isTaken
        ? 'taken'
        : isMissed
        ? 'missed'
        : 'skipped';

    const backendStatus =
      isTaken
        ? 'TOMADO'
        : isMissed
        ? 'PERDIDO'
        : 'PULADO';

    const medId = String(
      l.medicamentoId ||
        l.medicationId ||
        (
          typeof l.medicamento ===
          'object'
            ? l.medicamento?.id ||
              l.medicamento?._id
            : l.medicamento
        ) ||
        ''
    ).trim();

    return {
      id: String(
        l.id ||
          l._id ||
          Date.now()
      ).trim(),

      _id: String(
        l._id ||
          l.id ||
          Date.now()
      ).trim(),

      medicationId:
        medId,

      scheduledTime:
        normalizeTime(
          l.horarioAgendado ||
            l.scheduledTime ||
            l.horario
        ),

      status:
        frontendStatus,

      situacao:
        backendStatus,

      date:
        normalizeDate(
          l.data ||
            l.date ||
            l.criadoEm ||
            l.createdAt
        ),

      notes:
        l.observacao ||
        l.notes,
    };
  };

  const parseToApiPayload = (
    med: any
  ) => {
    return {
      nome:
        med.name ||
        med.nome,

      dosagem:
        med.dosage ||
        med.dosagem,

      unidade:
        med.unit ||
        med.unidade ||
        'mg',

      frequencia:
        med.frequency ||
        med.frequencia ||
        'Diário',

      horarios:
        med.times ||
        med.horarios ||
        [],

      dataInicio:
        med.startDate ||
        med.dataInicio ||
        getTodayString(),

      dataTermino:
        med.endDate ||
        med.dataTermino ||
        null,

      cor:
        med.color ||
        med.cor ||
        '#3b82f6',

      icone:
        med.icon ||
        med.icone ||
        'Pill',

      categoria:
        med.category ||
        med.categoria ||
        'Geral',

      estoqueAtual:
        Number(
          med.stock ??
            med.estoqueAtual ??
            med.estoque ??
            0
        ),

      estoqueMaximo:
        Number(
          med.stockMax ??
            med.estoqueMaximo ??
            30
        ),

      lembreteAtivo:
        med.reminderEnabled ??
        med.lembreteAtivo ??
        true,

      ativo:
        med.active ??
        med.ativo ??
        true,

      urlImagem:
        med.imageUrl ||
        med.urlImagem ||
        null,

      medicoPrescritor:
        med.prescribedBy ||
        med.medicoPrescritor ||
        med.medico ||
        null,

      instrucoes:
        med.instructions ||
        med.instrucoes ||
        null,

      efeitosColaterais:
        med.sideEffects ||
        med.efeitosColaterais ||
        null,
    };
  };

  /*
   * =======================================================
   * ADESÃO
   * =======================================================
   */

  const fetchAdherence =
    useCallback(async () => {
      try {
        const res =
          await api.registros.adesao();

        if (res?.dados) {
          setAdherence({
            dias7: Number(
              res.dados.dias7 ?? 0
            ),

            dias30: Number(
              res.dados.dias30 ?? 0
            ),
          });
        }
      } catch (error) {
        console.error(
          'Erro ao buscar taxa de adesão:',
          error
        );
      }
    }, []);

  /*
   * =======================================================
   * MEDICAMENTOS
   * =======================================================
   */

  const fetchMedications =
    useCallback(async () => {
      try {
        /*
         * Se não existe usuário logado,
         * não carregamos absolutamente nada.
         */
        const usuarioId =
          obterUsuarioId();

        if (!usuarioId) {
          setMedications([]);
          setLogs([]);
          return;
        }

        const [
          medsRes,
          logsRes,
        ] =
          await Promise.all([
            api.medicamentos
              .listar(),

            api.registros
              .listar()
              .catch(() => null),
          ]);

        /*
         * IMPORTANTE:
         * Mesmo que a API retorne [],
         * substituímos o estado.
         */
        if (
          medsRes?.dados &&
          Array.isArray(
            medsRes.dados
          )
        ) {
          const formatados =
            medsRes.dados.map(
              formatMed
            );

          setMedications(
            formatados
          );

          const key =
            getStorageKey(
              'meds'
            );

          if (key) {
            localStorage.setItem(
              key,
              JSON.stringify(
                formatados
              )
            );
          }
        } else {
          setMedications([]);
        }

        if (
          logsRes?.dados &&
          Array.isArray(
            logsRes.dados
          )
        ) {
          const logsFormatados =
            logsRes.dados.map(
              parseLog
            );

          setLogs(
            logsFormatados
          );

          const key =
            getStorageKey(
              'logs'
            );

          if (key) {
            localStorage.setItem(
              key,
              JSON.stringify(
                logsFormatados
              )
            );
          }
        } else {
          setLogs([]);
        }

        await fetchAdherence();
      } catch (error) {
        console.error(
          'Erro ao carregar dados da API:',
          error
        );
      }
    }, [
      fetchAdherence,
    ]);

  /*
   * Quando o provider monta:
   *
   * 1. limpa o estado
   * 2. carrega cache do usuário
   * 3. busca dados reais da API
   */
  useEffect(() => {
    setMedications([]);
    setLogs([]);

    carregarCache();

    fetchMedications();
  }, [
    carregarCache,
    fetchMedications,
  ]);

  /*
   * =======================================================
   * CRIAR MEDICAMENTO
   * =======================================================
   */

  const addMedication =
    async (
      medData: Omit<
        Medication,
        'id'
      > & {
        id?: string;
        _id?: string;
      }
    ) => {
      const usuarioId =
        obterUsuarioId();

      if (!usuarioId) {
        throw new Error(
          'Usuário não autenticado'
        );
      }

      const payload =
        parseToApiPayload(
          medData
        );

      try {
        /*
         * NÃO enviamos usuarioId.
         *
         * O backend descobre o usuário
         * pelo JWT.
         */
        const res =
          await api.medicamentos.criar(
            payload
          );

        if (res?.dados) {
          const novoMed =
            formatMed(
              res.dados
            );

          setMedications(
            prev => {
              const novoEstado =
                [
                  ...prev,
                  novoMed,
                ];

              const key =
                getStorageKey(
                  'meds'
                );

              if (key) {
                localStorage.setItem(
                  key,
                  JSON.stringify(
                    novoEstado
                  )
                );
              }

              return novoEstado;
            }
          );
        }
      } catch (error) {
        console.error(
          'Erro ao criar medicamento na API:',
          error
        );

        throw error;
      }
    };

  /*
   * =======================================================
   * ATUALIZAR
   * =======================================================
   */

  const updateMedication =
    async (
      id: string,
      data: Partial<Medication>
    ) => {
      if (!id) {
        return;
      }

      try {
        /*
         * PUT /medicamentos/:id exige todos os campos obrigatórios.
         * Portanto, quando a tela envia apenas { active: false },
         * mesclamos os dados atuais antes de montar o payload.
         */
        const atual = medications.find(
          m =>
            String(m.id) === String(id) ||
            String(m._id) === String(id)
        );

        const dadosCompletos: Medication = {
          ...(atual || ({} as Medication)),
          ...data,
          id: atual?.id || String(id),
          _id: atual?._id || String(id),
        };

        const res =
          await api.medicamentos.atualizar(
            String(id),
            parseToApiPayload(
              dadosCompletos
            )
          );

        const medAtualizado =
          formatMed(
            res?.dados ||
              dadosCompletos
          );

        setMedications(
          prev => {
            const novoEstado =
              prev.map(m =>
                String(m.id) === String(id) ||
                String(m._id) === String(id)
                  ? medAtualizado
                  : m
              );

            const key =
              getStorageKey('meds');

            if (key) {
              localStorage.setItem(
                key,
                JSON.stringify(novoEstado)
              );
            }

            return novoEstado;
          }
        );
      } catch (error) {
        console.error(
          'Erro ao atualizar medicamento:',
          error
        );

        throw error;
      }
    };

  /*
   * Alterna somente o status ativo/inativo.
   * Usa o endpoint PATCH específico do backend.
   */
  const toggleMedication =
    async (id: string) => {
      if (!id) {
        return;
      }

      const atual = medications.find(
        m =>
          String(m.id) === String(id) ||
          String(m._id) === String(id)
      );

      if (!atual) {
        return;
      }

      const novoAtivo = !Boolean(
        atual.active
      );

      try {
        const res =
          await api.medicamentos.alternar(
            String(id)
          );

        const medAtualizado =
          res?.dados
            ? formatMed(res.dados)
            : {
                ...atual,
                active: novoAtivo,
              };

        setMedications(
          prev => {
            const novoEstado =
              prev.map(m =>
                String(m.id) === String(id) ||
                String(m._id) === String(id)
                  ? medAtualizado
                  : m
              );

            const key =
              getStorageKey('meds');

            if (key) {
              localStorage.setItem(
                key,
                JSON.stringify(novoEstado)
              );
            }

            return novoEstado;
          }
        );
      } catch (error) {
        console.error(
          'Erro ao alternar status do medicamento:',
          error
        );

        throw error;
      }
    };

  /*
   * =======================================================
   * EXCLUIR
   * =======================================================
   */

  const deleteMedication =
    async (
      id: string
    ) => {
      if (!id) {
        return;
      }

      try {
        await api.medicamentos.excluir(
          String(id)
        );

        setMedications(
          prev => {
            const novoEstado =
              prev.filter(
                m =>
                  String(m.id) !==
                    String(id) &&
                  String(m._id) !==
                    String(id)
              );

            const key =
              getStorageKey(
                'meds'
              );

            if (key) {
              localStorage.setItem(
                key,
                JSON.stringify(
                  novoEstado
                )
              );
            }

            return novoEstado;
          }
        );
      } catch (error) {
        console.error(
          'Erro ao excluir medicamento:',
          error
        );

        throw error;
      }
    };

  /*
   * =======================================================
   * REGISTRO DE DOSE
   * =======================================================
   */

  const logDose =
    async (
      medicationId: string,
      time: string,
      status: string,
      notes?: string
    ) => {
      const todayStr =
        getTodayString();

      const cleanTime =
        normalizeTime(time);

      const cleanMedId =
        String(
          medicationId
        ).trim();

      const rawStatus =
        String(status)
          .trim()
          .toLowerCase();

      const isTaken = [
        'taken',
        'tomado',
        'concluido',
        'ok',
        'true',
      ].includes(
        rawStatus
      );

      const isMissed = [
        'missed',
        'perdido',
        'atrasado',
      ].includes(
        rawStatus
      );

      const frontendStatus:
        | 'taken'
        | 'skipped'
        | 'missed' =
        isTaken
          ? 'taken'
          : isMissed
          ? 'missed'
          : 'skipped';

      const backendStatus =
        isTaken
          ? 'TOMADO'
          : isMissed
          ? 'PERDIDO'
          : 'PULADO';

      const existingLog =
        logs.find(
          l =>
            String(
              l.medicationId
            ).trim() ===
              cleanMedId &&
            normalizeTime(
              l.scheduledTime
            ) === cleanTime &&
            normalizeDate(
              l.date
            ) === todayStr
        );

      const wasTakenBefore =
        existingLog?.status ===
          'taken' ||
        existingLog?.situacao ===
          'TOMADO';

      const newLog: DoseLog = {
        id: String(
          Date.now()
        ),

        _id: String(
          Date.now()
        ),

        medicationId:
          cleanMedId,

        scheduledTime:
          cleanTime,

        status:
          frontendStatus,

        situacao:
          backendStatus,

        date:
          todayStr,

        notes,
      };

      setLogs(
        prev => {
          const novoEstado = [
            newLog,
            ...prev.filter(
              l =>
                !(
                  String(
                    l.medicationId
                  ).trim() ===
                    cleanMedId &&
                  normalizeTime(
                    l.scheduledTime
                  ) === cleanTime &&
                  normalizeDate(
                    l.date
                  ) === todayStr
                )
            ),
          ];

          const key =
            getStorageKey(
              'logs'
            );

          if (key) {
            localStorage.setItem(
              key,
              JSON.stringify(
                novoEstado
              )
            );
          }

          return novoEstado;
        }
      );

      if (
        isTaken &&
        !wasTakenBefore
      ) {
        setMedications(
          prev => {
            const novoEstado =
              prev.map(m => {
                if (
                  String(
                    m.id
                  ).trim() ===
                    cleanMedId ||
                  String(
                    m._id
                  ).trim() ===
                    cleanMedId
                ) {
                  const newStock =
                    Math.max(
                      0,
                      (m.stock ??
                        1) - 1
                    );

                  /*
                   * Atualiza no backend.
                   * O backend ainda verifica o dono
                   * do medicamento pelo JWT.
                   */
                  api.medicamentos
                    .atualizar(
                      String(
                        cleanMedId
                      ),
                      parseToApiPayload(
                        {
                          ...m,
                          stock:
                            newStock,
                        }
                      )
                    )
                    .catch(
                      console.error
                    );

                  return {
                    ...m,
                    stock:
                      newStock,
                  };
                }

                return m;
              });

            const key =
              getStorageKey(
                'meds'
              );

            if (key) {
              localStorage.setItem(
                key,
                JSON.stringify(
                  novoEstado
                )
              );
            }

            return novoEstado;
          }
        );
      }

      try {
        const res =
          await api.registros.salvar(
            cleanMedId,
            cleanTime,
            backendStatus,
            notes
          );

        if (res?.dados) {
          const parsedServerLog =
            parseLog(
              res.dados
            );

          setLogs(
            prev => {
              const novoEstado =
                prev.map(
                  l =>
                    l.id ===
                    newLog.id
                      ? parsedServerLog
                      : l
                );

              const key =
                getStorageKey(
                  'logs'
                );

              if (key) {
                localStorage.setItem(
                  key,
                  JSON.stringify(
                    novoEstado
                  )
                );
              }

              return novoEstado;
            }
          );
        }

        await fetchAdherence();
      } catch (error) {
        console.error(
          'Erro ao salvar registro:',
          error
        );
      }
    };

  /*
   * =======================================================
   * DOSES PERDIDAS
   * =======================================================
   */

  useEffect(() => {
    if (
      medications.length === 0
    ) {
      return;
    }

    const checkMissedDoses =
      () => {
        const todayStr =
          getTodayString();

        medications
          .filter(
            m => m.active
          )
          .forEach(med => {
            (
              med.times || []
            ).forEach(time => {
              const cleanTime =
                normalizeTime(
                  time
                );

              const medId =
                String(
                  med.id ||
                    med._id
                ).trim();

              const hasLog =
                logs.some(
                  l =>
                    String(
                      l.medicationId
                    ).trim() ===
                      medId &&
                    normalizeTime(
                      l.scheduledTime
                    ) ===
                      cleanTime &&
                    normalizeDate(
                      l.date
                    ) ===
                      todayStr
                );

              if (
                !hasLog &&
                isTimePassed(
                  cleanTime
                )
              ) {
                logDose(
                  medId,
                  cleanTime,
                  'missed'
                );
              }
            });
          });
      };

    checkMissedDoses();

    const interval =
      setInterval(
        checkMissedDoses,
        30000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    medications,
    logs,
  ]);

  /*
   * =======================================================
   * TELA DE HOJE
   * =======================================================
   */

  const getTodayMedications =
    (): TodayMedicationItem[] => {
      const todayStr =
        getTodayString();

      const items: TodayMedicationItem[] =
        [];

      medications
        .filter(
          m => m.active
        )
        .forEach(med => {
          (
            med.times || []
          ).forEach(time => {
            const cleanTime =
              normalizeTime(
                time
              );

            const medId =
              String(
                med.id ||
                  med._id
              ).trim();

            const log =
              logs.find(
                l => {
                  const matchMed =
                    String(
                      l.medicationId
                    ).trim() ===
                    medId;

                  const matchTime =
                    normalizeTime(
                      l.scheduledTime
                    ) ===
                    cleanTime;

                  const matchDate =
                    normalizeDate(
                      l.date
                    ) ===
                    todayStr;

                  return (
                    matchMed &&
                    matchTime &&
                    matchDate
                  );
                }
              );

            items.push({
              medication: med,
              scheduledTime:
                cleanTime,
              log,
            });
          });
        });

      return items;
    };

  const getUpcomingDoses =
    (): {
      medication: Medication;
      time: string;
    }[] => {
      const todayMeds =
        getTodayMedications();

      return todayMeds
        .filter(
          item =>
            !item.log &&
            !isTimePassed(
              item.scheduledTime
            )
        )
        .map(
          item => ({
            medication:
              item.medication,
            time:
              item.scheduledTime,
          })
        );
    };

  const getAdherenceRate = (
    days: number
  ): number => {
    if (
      logs.length === 0
    ) {
      return 100;
    }

    const today =
      new Date();

    const limitDate =
      new Date();

    limitDate.setDate(
      today.getDate() -
        days
    );

    const recentLogs =
      logs.filter(l => {
        const logDate =
          new Date(
            l.date
          );

        return (
          logDate >=
          limitDate
        );
      });

    const targetLogs =
      recentLogs.length > 0
        ? recentLogs
        : logs;

    const tomadas =
      targetLogs.filter(
        l =>
          l.status ===
            'taken' ||
          l.situacao ===
            'TOMADO'
      ).length;

    return Math.round(
      (tomadas /
        targetLogs.length) *
        100
    );
  };

  return (
    <MedContext.Provider
      value={{
        medications,
        logs,
        adherence,

        addMedication,

        updateMedication,

        toggleMedication,

        deleteMedication,

        logDose,

        getTodayMedications,

        getUpcomingDoses,

        getAdherenceRate,

        fetchMedications,

        fetchAdherence,
      }}
    >
      {children}
    </MedContext.Provider>
  );
};

export { useMed } from './useMed';