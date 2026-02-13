import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Client,
  Driver,
  Truck,
  Supply,
  SupplyReturn,
  CashOperation,
  Expense,
  Repair,
  Exchange,
  DefectiveBottle,
  Inventory,
  FuelPurchase,
  FuelConsumption,
  FuelDrain,
  OilPurchase,
  OilConsumption,
  OilDrain,
  Revenue,
  BankTransfer,
  FinancialTransaction,
  BottleType,
  ForeignBottle,
  EmptyBottlesStock,
  Brand,
  StockHistory,
} from "@/types";

export function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const v = window.localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : defaultValue;
  });
  React.useEffect(() => {
    const envBase = (import.meta as any)?.env?.VITE_API_URL;
    const baseUrl = envBase || (typeof window !== "undefined" ? `${window.location.origin}/api` : "");
    if (!baseUrl) return;
    const url = `${baseUrl}/storage/${encodeURIComponent(key)}`;
    let active = true;
    fetch(url)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!active) return;
        if (d && typeof d.value !== "undefined") setValue(d.value as T);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [key]);
  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
    const envBase = (import.meta as any)?.env?.VITE_API_URL;
    const baseUrl = envBase || (typeof window !== "undefined" ? `${window.location.origin}/api` : "");
    if (!baseUrl) return;
    const url = `${baseUrl}/storage/${encodeURIComponent(key)}`;
    const body = JSON.stringify({ value });
    fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body }).catch(() => {});
  }, [key, value]);
  return [value, setValue];
}

// AppContextType interface additions
interface AppContextType {
  clients: Client[];
  addClient: (client: Client) => string;
  brands: Brand[];
  addBrand: (brand: Brand) => void;
  drivers: Driver[];
  addDriver: (driver: Driver) => void;
  updateDriver: (driverId: string, updates: Partial<Driver>) => void;
  updateDriverDebt: (driverId: string, delta: number) => void;
  // Enregistre le paiement et ajuste la dette et les avances selon le montant
  recordDriverPayment: (driverId: string, amount: number) => void;
  updateBrand: (id: string, patch: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  trucks: Truck[];
  addTruck: (truck: Truck) => void;
  // Fonctions de gestion des camions requises pour la page Gestion des Camions
  updateTruck: (id: string, patch: Partial<Truck>) => void;
  bulkSetRepos: (ids: string[], reposReason?: string, nextReturnDate?: string) => void;
  bulkReactivate: (ids: string[]) => void;
  bulkDissociateDriver: (ids: string[]) => void;
  driverHasActiveTruck: (driverId: string) => Truck | undefined;
  truckAssignments: any[];
  supplies: Supply[];
  addSupply: (supply: Supply) => void;
  supplyReturns: SupplyReturn[];
  addSupplyReturn: (supplyReturn: SupplyReturn) => void;
  supplyOrders: any[];
  addSupplyOrder: (order: any) => void;
  updateSupplyOrder: (order: any) => void;
  deleteSupplyOrder: (id: string) => void;
  returnOrders: any[];
  addReturnOrder: (order: any) => void;
  deleteReturnOrder: (id: string) => void;
  cashOperations: CashOperation[];
  addCashOperation: (op: CashOperation) => void;
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string | number) => void;
  repairs: Repair[];
  addRepair: (repair: Repair) => void;
  updateRepair: (id: string, patch: Partial<Repair>) => void;
  deleteRepair: (id: string) => void;
  exchanges: Exchange[];
  addExchange: (exchange: Exchange) => void;
  emptyBottlesStock: EmptyBottlesStock[];
  addEmptyStock: (stock: EmptyBottlesStock) => void;
  updateEmptyBottlesStock: (id: string, patch: Partial<EmptyBottlesStock>) => void;
  updateEmptyBottlesStockByBottleType: (bottleTypeId: string, patch: Partial<EmptyBottlesStock>) => void;
  defectiveStock: DefectiveBottle[];
  addDefectiveStock: (stock: DefectiveBottle) => void;
  addDefectiveBottle: (bottle: DefectiveBottle) => void;
  updateDefectiveBottlesStock: (id: string, patch: Partial<DefectiveBottle>) => void;
  bottleTypes: BottleType[];
  updateBottleType: (id: string, patch: Partial<BottleType>) => void;
  transactions: any[];
  addTransaction: (transaction: any) => void;
  foreignBottles: ForeignBottle[];
  addForeignBottle: (bottle: ForeignBottle) => void;
  inventory: Inventory[];
  updateInventory: (id: string, patch: Partial<Inventory>) => void;
  clearAllInventory: () => void;
  revenues: Revenue[];
  addRevenue: (revenue: Omit<Revenue, "id"> & { id?: string }) => void;
  bankTransfers: BankTransfer[];
  addBankTransfer: (transfer: BankTransfer) => void;
  updateBankTransfer: (id: string, patch: Partial<BankTransfer>) => void;
  validateBankTransfer: (id: string, validator?: string) => void;
  deleteBankTransfer: (id: string) => void;
  financialTransactions: FinancialTransaction[];
  addFinancialTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  stockHistory: StockHistory[];
  addStockHistory: (history: Omit<StockHistory, 'id'>) => void;
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  expenseTypes: string[];
  addExpenseType: (type: string) => void;
  // Data management functions
  exportData: () => void;
  importData: (jsonData: string) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialTrucks: Truck[] = [];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useStickyState<Client[]>([], "clients");
  const [brands, setBrands] = useStickyState<Brand[]>([], "brands");
  const [drivers, setDrivers] = useStickyState<Driver[]>([], "drivers");
  const [trucks, setTrucks] = useStickyState<Truck[]>([], "trucks");
  const [truckAssignments, setTruckAssignments] = useStickyState<any[]>([], "truckAssignments");
  const [supplies, setSupplies] = useStickyState<Supply[]>([], "supplies");
  const [supplyReturns, setSupplyReturns] = useStickyState<SupplyReturn[]>([], "supplyReturns");
  const [supplyOrders, setSupplyOrders] = useStickyState<any[]>([], "supplyOrders");
  const [returnOrders, setReturnOrders] = useStickyState<any[]>([], "returnOrders");
  const [cashOperations, setCashOperations] = useStickyState<CashOperation[]>([], "cashOperations");
  const [expenses, setExpenses] = useStickyState<Expense[]>([], "expenses");
  const [repairs, setRepairs] = useStickyState<Repair[]>([], "repairs");
  const [exchanges, setExchanges] = useStickyState<Exchange[]>([], "exchanges");
  const [emptyBottlesStock, setEmptyBottlesStock] = useStickyState<EmptyBottlesStock[]>([], "emptyBottlesStock");
  const [defectiveStock, setDefectiveStock] = useStickyState<DefectiveBottle[]>([], "defectiveStock");
  const [bottleTypes, setBottleTypes] = useStickyState<BottleType[]>([], "bottleTypes");
  const [transactions, setTransactions] = useStickyState<any[]>([], "transactions");
  const [foreignBottles, setForeignBottles] = useStickyState<ForeignBottle[]>([], "foreignBottles");
  const [inventory, setInventory] = useStickyState<Inventory[]>([], "inventory");
  const [fuelPurchases, setFuelPurchases] = useStickyState<FuelPurchase[]>([], "fuelPurchases");
  const [fuelConsumptions, setFuelConsumptions] = useStickyState<FuelConsumption[]>([], "fuelConsumptions");
  const [fuelDrains, setFuelDrains] = useStickyState<FuelDrain[]>([], "fuelDrains");
  const [oilPurchases, setOilPurchases] = useStickyState<OilPurchase[]>([], "oilPurchases");
  const [oilConsumptions, setOilConsumptions] = useStickyState<OilConsumption[]>([], "oilConsumptions");
  const [oilDrains, setOilDrains] = useStickyState<OilDrain[]>([], "oilDrains");
  
    // New states for Revenue page
    const [revenues, setRevenues] = useStickyState<Revenue[]>([], "revenues");
    const [bankTransfers, setBankTransfers] = useStickyState<BankTransfer[]>([], "bankTransfers");
    const [financialTransactions, setFinancialTransactions] = useStickyState<FinancialTransaction[]>(
      [],
      "financialTransactions"
    );
    const [stockHistory, setStockHistory] = useStickyState<StockHistory[]>([], "stockHistory");
    const [suppliers, setSuppliers] = useStickyState<Supplier[]>([], "suppliers");
    
    const [expenseTypes, setExpenseTypes] = useStickyState<string[]>([
      'bureau', 'salaire', 'cnss', 'loyer', 'charger dépôt', 'équipement', 'électricité', 'transport', 'autre'
    ], "expenseTypes");

    const addExpenseType = (type: string) => {
      setExpenseTypes(prev => {
        if (!prev.includes(type)) {
          const newTypes = [...prev];
          const autreIndex = newTypes.indexOf('autre');
          if (autreIndex !== -1) {
            newTypes.splice(autreIndex, 0, type);
            return newTypes;
          }
          return [...newTypes, type];
        }
        return prev;
      });
    };
  
    const addClient = (client: Client) => {
      const id = client.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
      const newClient = { ...client, id };
      setClients((prev) => [...prev, newClient]);
      return id;
    };

    const addSupplier = (supplier: Supplier) => {
      const id = supplier.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
      setSuppliers((prev) => [...prev, { ...supplier, id }]);
    };

    const updateSupplier = (id: string, patch: Partial<Supplier>) => {
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    };

    const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

    const addBrand = (brand: Brand) => {
      const id = brand.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
      setBrands(prev => [...prev, { ...brand, id }]);
    };
  
    const updateBrand = (id: string, patch: Partial<Brand>) => {
      setBrands(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)));
    };
  
    const deleteBrand = (id: string) => {
      setBrands(prev => prev.filter(b => b.id !== id));
    };

    const addDriver = (driver: Driver) => {
      const id = driver.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
      setDrivers(prev => [...prev, { ...driver, id }]);
    };
  
    // Ensure all drivers have unique string ids (fixes React key warnings)
    React.useEffect(() => {
      setDrivers(prev => {
        let changed = false;
        const seen = new Set<string>();
        const next = prev.map(d => {
          let id = d.id ? String(d.id) : (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
          if (seen.has(id)) {
            id = (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
            changed = true;
          }
          seen.add(id);
          if (!d.id || d.id !== id) changed = true;
          return { ...d, id };
        });
        return changed ? next : prev;
      });
    }, []);

    // Ensure all clients have unique string ids
    React.useEffect(() => {
      setClients(prev => {
        let changed = false;
        const seen = new Set<string>();
        const next = prev.map(c => {
          let id = c.id ? String(c.id) : (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
          if (seen.has(id)) {
            id = (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
            changed = true;
          }
          seen.add(id);
          if (!c.id || c.id !== id) changed = true;
          return { ...c, id };
        });
        return changed ? next : prev;
      });
    }, []);
  
    // Update a driver's debt and recompute balance
    const updateDriverDebt = (driverId: string, delta: number) => {
      setDrivers(prev =>
        prev.map(d => {
          if (String(d.id) === String(driverId)) {
            const nextDebt = Math.max(0, (d.debt || 0) + delta);
            const nextBalance = (d.advances || 0) - nextDebt;
            
            addTransaction({
              date: new Date().toISOString(),
              type: delta > 0 ? 'debt' : 'payment',
              amount: Math.abs(delta),
              driverId: driverId,
              description: delta > 0 ? `Augmentation de la dette de ${delta} DH.` : `Réduction de la dette de ${Math.abs(delta)} DH.`,
            });
  
            return { ...d, debt: nextDebt, balance: nextBalance };
          }
          return d;
        })
      );
    };
  
    // New : enregistrer le paiement — l'excédent devient une avance
    const recordDriverPayment = (driverId: string, amount: number) => {
      setDrivers(prev =>
        prev.map(d => {
          if (String(d.id) === String(driverId)) {
            const currentDebt = d.debt || 0;
            const currentAdvances = d.advances || 0;
  
            let nextDebt: number;
            let nextAdvances: number;
            let description = "";
  
            if (amount <= currentDebt) {
              // Payment is less than or equal to debt
              nextDebt = currentDebt - amount;
              nextAdvances = currentAdvances;
              description = `Paiement de ${amount} DH sur la dette.`;
            } else {
              // Payment covers debt and adds to advances
              const debtPaid = currentDebt;
              const advance = amount - currentDebt;
              nextDebt = 0;
              nextAdvances = currentAdvances + advance;
              description = `Paiement de la dette (${debtPaid} DH) et ajout d'une avance (${advance} DH).`;
            }
  
            addTransaction({
              date: new Date().toISOString(),
              type: 'payment',
              amount: amount,
              driverId: driverId,
              description: description,
            });
  
            const nextBalance = nextAdvances - nextDebt;
            return { ...d, debt: nextDebt, advances: nextAdvances, balance: nextBalance };
          }
          return d;
        })
      );
    };
  
    // Sanitize trucks: ensure unique string ids
    React.useEffect(() => {
      setTrucks(prev => {
        let changed = false;
        const seen = new Set<string>();
        const next = prev.map(t => {
          let id = t.id ? String(t.id) : (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
          if (seen.has(id)) {
            id = (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
            changed = true;
          }
          seen.add(id);
          if (!t.id || t.id !== id) changed = true;
          return { ...t, id };
        });
        return changed ? next : prev;
      });
    }, []);
  
    // Ensure default 'petit-camion' trucks exist
    React.useEffect(() => {
      setTrucks(prev => {
        if (prev.some(t => t.truckType === 'petit-camion')) return prev;
        return [
          ...prev,
          { id: 'a1', matricule: 'AL-1001', driverId: '', isActive: true, currentLoad: [], truckType: 'petit-camion' },
          { id: 'a2', matricule: 'AL-1002', driverId: '', isActive: true, currentLoad: [], truckType: 'petit-camion' },
        ];
      });
    }, []);
    const addTruck = (truck: Truck) =>
      setTrucks(prev => [...prev, { ...truck, id: truck.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) }]);
    const addSupply = (supply: Supply) => setSupplies((prev) => [...prev, supply]);
    const addSupplyReturn = (supplyReturn: SupplyReturn) => setSupplyReturns((prev) => [...prev, supplyReturn]);
  
    // Harmonisation : s'assurer que chaque SupplyOrder a un id unique lors du chargement
    React.useEffect(() => {
      setSupplyOrders(prev => {
        let changed = false;
        const seen = new Set<string>();
        const next = prev.map(o => {
          let id = o.id ? String(o.id) : (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
          if (seen.has(id)) {
            id = (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
            changed = true;
          }
          seen.add(id);
          if (!o.id || o.id !== id) changed = true;
          return { ...o, id };
        });
        return changed ? next : prev;
      });
    }, []);
  
    const addSupplyOrder = (order: any) =>
      setSupplyOrders(prev => [
        ...prev,
        { ...order, id: order.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) }
      ]);
    const updateSupplyOrder = (updatedOrder: any) => {
      setSupplyOrders(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    };
    const deleteSupplyOrder = (id: string) => {
      setSupplyOrders(prev => prev.filter(order => order.id !== id));
    };
  
  // Create a new return order and update driver’s debt/balance
  const addReturnOrder = (
    supplyOrderId: string,
    items: any[],
    totalVentes: number,
    totalExpenses: number,
    totalRC: number,
    amountPaid: number,
    driverId: string,
    driverDebtChange: number,
    creditChange: number,
    note: string,
    orderNumber?: string,
    paymentCash?: number,
    paymentCheque?: number,
    paymentMygaz?: number,
    paymentDebt?: number,
    paymentTotal?: number
  ): string => {
    const id = `ret-${Date.now()}`;
    const supplyOrder = supplyOrders.find(o => o.id === supplyOrderId);
  
    const newReturnOrder: any = {
      id,
      orderNumber: orderNumber || `BD-${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString(),
      supplyOrderId,
      supplyOrderNumber: supplyOrder?.orderNumber || '',
      driverId,
      driverName: drivers.find(d => String(d.id) === String(driverId))?.name,
      clientId: supplyOrder?.clientId,
      clientName: supplyOrder?.clientName,
      items,
      totalVentes,
      totalExpenses,
      totalRC,
      amountPaid,
      note,
      paymentCash,
      paymentCheque,
      paymentMygaz,
      paymentDebt,
      paymentTotal,
    };

    setReturnOrders(prev => [...prev, newReturnOrder]);

    // Update driver debt, balance AND remaining bottles
    const remainingBottlesUpdate: Record<string, number> = {};
    items.forEach((item: any) => {
      if (item.lostQuantity > 0) {
        remainingBottlesUpdate[item.bottleTypeId] = item.lostQuantity;
      }
    });

    updateDriver(driverId, { 
      debt: driverDebtChange, 
      balance: creditChange,
      remainingBottles: remainingBottlesUpdate 
    });

    // Enregistrer la transaction dans l'historique du chauffeur
    if (driverDebtChange !== 0) {
      addTransaction({
        date: new Date().toISOString(),
        type: driverDebtChange > 0 ? 'debt' : 'payment',
        amount: Math.abs(driverDebtChange),
        driverId: driverId,
        description: `B.D ${orderNumber || id} : Dette restante de ${driverDebtChange} DH.`,
      });
    }

    // Record the financial transactions for the payments
    if (paymentCash && paymentCash > 0) {
      addCashOperation({
        date: new Date().toISOString(),
        name: `Règlement Espèce (B.D ${orderNumber || id})`,
        amount: paymentCash,
        type: 'versement',
        accountAffected: 'espece',
        status: 'validated',
      });
    }
    if (paymentCheque && paymentCheque > 0) {
      addCashOperation({
        date: new Date().toISOString(),
        name: `Règlement Chèque (B.D ${orderNumber || id})`,
        amount: paymentCheque,
        type: 'versement',
        accountAffected: 'cheque',
        status: 'validated',
      });
    }
    if (paymentMygaz && paymentMygaz > 0) {
      addCashOperation({
        date: new Date().toISOString(),
        name: `Règlement MyGaz (B.D ${orderNumber || id})`,
        amount: paymentMygaz,
        type: 'versement',
        accountAffected: 'autre',
        accountDetails: 'MyGaz',
        status: 'validated',
      });
    }

    return id;
  };
  
  const deleteReturnOrder = (id: string) => {
    setReturnOrders(prev => prev.filter(order => order.id !== id));
  };
  
  // Cash operations helpers
  const addCashOperation = (operation: CashOperation) => {
    const id = operation.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setCashOperations(prev => [...prev, { ...operation, id }]);

    addFinancialTransaction({
      id, // Use the same ID
      date: operation.date,
      type: operation.type === 'versement' ? 'versement' : 'retrait',
      description: operation.name,
      amount: operation.type === 'versement' ? operation.amount : -operation.amount,
      sourceAccount: operation.type === 'versement' ? 'autre' : operation.accountAffected,
      destinationAccount: operation.type === 'versement' ? operation.accountAffected : 'autre',
      accountDetails: operation.accountDetails,
      status: operation.status === 'validated' ? 'completed' : 'pending',
      createdAt: new Date().toISOString(),
    });
  };

  const addExpense = (expense: Expense) => {
    const id = expense.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setExpenses(prev => [...prev, { ...expense, id }]);

    addFinancialTransaction({
      id, // Use the same ID
      date: expense.date,
      type: 'dépense',
      description: `Dépense: ${expense.type} [${expense.code || 'N/A'}]${expense.note ? ' - ' + expense.note : ''}`,
      amount: -expense.amount,
      sourceAccount: expense.paymentMethod.toLowerCase() as any,
      destinationAccount: 'charge',
      status: 'completed',
      createdAt: new Date().toISOString(),
    });
  };

  const updateExpense = (id: string, patch: Partial<Expense>) => {
    setExpenses(prev => prev.map(exp => (exp.id === id ? { ...exp, ...patch } : exp)));
    
    // Update financial transaction if it exists
    setFinancialTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        return {
          ...tx,
          date: patch.date ?? tx.date,
          amount: patch.amount !== undefined ? -patch.amount : tx.amount,
          description: (patch.type || patch.code || patch.note) 
            ? `Dépense: ${patch.type || tx.description.split(' [')[0].replace('Dépense: ', '')} [${patch.code || tx.description.split('[')[1]?.split(']')[0] || 'N/A'}]${patch.note ? ' - ' + patch.note : (tx.description.includes(' - ') ? ' - ' + tx.description.split(' - ')[1] : '')}`
            : tx.description,
          sourceAccount: patch.paymentMethod ? patch.paymentMethod.toLowerCase() as any : tx.sourceAccount,
        };
      }
      return tx;
    }));
  };

  const deleteExpense = (expenseId: string) => {
    deleteFinancialTransaction(expenseId);
  };

  const addRepair = (repair: Repair) => {
    const id = repair.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setRepairs(prev => [...prev, { ...repair, id }]);

    if (repair.paidAmount > 0) {
      addFinancialTransaction({
        id, // Use the same ID
        date: repair.date,
        type: 'dépense',
        description: `Réparation: ${repair.remarks || repair.type}`,
        amount: -(Number(repair.paidAmount) || 0),
        sourceAccount: repair.paymentMethod.toLowerCase() as any,
        destinationAccount: 'reparation',
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const updateRepair = (id: string, patch: Partial<Repair>) => {
    setRepairs(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
    // Update financial transaction if it exists
    setFinancialTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        return {
          ...tx,
          date: patch.date ?? tx.date,
          amount: patch.paidAmount !== undefined ? -(Number(patch.paidAmount) || 0) : tx.amount,
          description: patch.remarks ? `Réparation: ${patch.remarks}` : tx.description,
          sourceAccount: patch.paymentMethod ? patch.paymentMethod.toLowerCase() as any : tx.sourceAccount,
        };
      }
      return tx;
    }));
  };

  const deleteRepair = (id: string) => {
    deleteFinancialTransaction(id);
  };

  const addExchange = (exchange: Exchange) => {
    const id = exchange.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setExchanges(prev => [...prev, { ...exchange, id }]);
  };

  const addEmptyStock = (stock: EmptyBottlesStock) => {
    const id = stock.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setEmptyBottlesStock(prev => [...prev, { ...stock, id }]);
  };

  const updateEmptyBottlesStock = (id: string, patch: Partial<EmptyBottlesStock>) => {
    setEmptyBottlesStock(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addStockHistory = (history: Omit<StockHistory, 'id'>) => {
    const id = window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    setStockHistory(prev => [{ ...history, id }, ...prev].slice(0, 1000)); // Keep last 1000 entries
  };

  const updateEmptyBottlesStockByBottleType = (bottleTypeId: string, delta: number) => {
    if (!delta) return;
    setEmptyBottlesStock(prev => {
      const idx = prev.findIndex(s => s.bottleTypeId === bottleTypeId);
      const bottleTypeName = bottleTypes.find(bt => bt.id === bottleTypeId)?.name || '';
      const now = new Date().toISOString();

      let previousQuantity = 0;
      let nextQuantity = 0;
      let next = [...prev];

      if (idx === -1) {
        nextQuantity = delta; // Allow negative stock
        const id = window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
        next = [
          ...prev,
          { id, bottleTypeId, bottleTypeName, quantity: nextQuantity, lastUpdated: now },
        ];
      } else {
        const current = prev[idx];
        previousQuantity = current.quantity || 0;
        nextQuantity = (current.quantity || 0) + delta; // Allow negative stock
        next[idx] = { ...current, quantity: nextQuantity, bottleTypeName, lastUpdated: now };
      }

      addStockHistory({
        date: now,
        bottleTypeId,
        bottleTypeName,
        stockType: 'empty',
        changeType: delta > 0 ? 'add' : 'remove',
        quantity: Math.abs(delta),
        previousQuantity,
        newQuantity: nextQuantity,
        note: `Mise à jour automatique du stock vide`
      });

      return next;
    });
  };

  // Modification : ajouter au stock de bouteilles défectueuses selon l'identifiant et la quantité (compatible avec les appels)
  const addDefectiveStock = (bottleTypeId: string, quantity: number) => {
    const bottleTypeName = bottleTypes.find(bt => bt.id === bottleTypeId)?.name || '';
    const id = window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const now = new Date().toISOString();

    // Calculate previous quantity for history
    const previousQuantity = defectiveStock
      .filter(d => d.bottleTypeId === bottleTypeId)
      .reduce((sum, d) => sum + d.quantity, 0);

    setDefectiveStock(prev => [
      ...prev,
      {
        id,
        returnOrderId: 'manual',
        bottleTypeId,
        bottleTypeName,
        quantity,
        date: now,
      },
    ]);

    addStockHistory({
      date: now,
      bottleTypeId,
      bottleTypeName,
      stockType: 'defective',
      changeType: 'add',
      quantity,
      previousQuantity,
      newQuantity: previousQuantity + quantity,
      note: 'Ajout manuel de stock défectueux'
    });
  };

  // تعديل: إضافة قنينة معيبة واحدة (يتولّد id إن لم يكن موجوداً)
  const addDefectiveBottle = (bottle: DefectiveBottle) => {
    const id = bottle.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    const now = new Date().toISOString();

    // Calculate previous quantity for history
    const previousQuantity = defectiveStock
      .filter(d => d.bottleTypeId === bottle.bottleTypeId)
      .reduce((sum, d) => sum + d.quantity, 0);

    setDefectiveStock(prev => [...prev, { ...bottle, id, date: bottle.date || now }]);

    addStockHistory({
      date: bottle.date || now,
      bottleTypeId: bottle.bottleTypeId,
      bottleTypeName: bottle.bottleTypeName,
      stockType: 'defective',
      changeType: 'add',
      quantity: bottle.quantity,
      previousQuantity,
      newQuantity: previousQuantity + bottle.quantity,
      note: 'Ajout de stock défectueux'
    });
  };

  // جديد: تحديث مخزون القنينات المعيبة حسب نوع القنينة والفرق (delta)
  const updateDefectiveBottlesStock = (bottleTypeId: string, delta: number) => {
    if (!delta) return;
    const now = new Date().toISOString();
    const bottleTypeName = bottleTypes.find(bt => bt.id === bottleTypeId)?.name || '';

    // Calculate previous quantity for history
    const previousQuantity = defectiveStock
      .filter(d => d.bottleTypeId === bottleTypeId)
      .reduce((sum, d) => sum + d.quantity, 0);

    if (delta > 0) {
      // زيادة المخزون: نسجل إدخالاً جديداً
      const id = window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
      setDefectiveStock(prev => [
        ...prev,
        {
          id,
          returnOrderId: 'factory',
          bottleTypeId,
          bottleTypeName,
          quantity: delta,
          date: now,
        },
      ]);
    } else {
      // نقص المخزون (مثلاً عند إرساله للمصنع للإصلاح): نخصم من الإدخالات القديمة
      setDefectiveStock(prev => {
        let remainingToSubtract = Math.abs(delta);
        let next = [...prev];
        
        // 1. Try to subtract from existing positive entries for this bottle type
        next = next.map(d => {
          if (d.bottleTypeId === bottleTypeId && d.quantity > 0 && remainingToSubtract > 0) {
            const subtractFromThis = Math.min(d.quantity, remainingToSubtract);
            remainingToSubtract -= subtractFromThis;
            return { ...d, quantity: d.quantity - subtractFromThis };
          }
          return d;
        }).filter(d => d.quantity !== 0); // Keep negative entries if any

        // 2. If there's still something to subtract, create a negative entry
        if (remainingToSubtract > 0) {
          const id = window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
          next.push({
            id,
            returnOrderId: 'factory_negative',
            bottleTypeId,
            bottleTypeName,
            quantity: -remainingToSubtract,
            date: now,
          });
        }
        
        return next;
      });
    }

    addStockHistory({
      date: now,
      bottleTypeId,
      bottleTypeName,
      stockType: 'defective',
      changeType: delta > 0 ? 'add' : 'remove',
      quantity: Math.abs(delta),
      previousQuantity,
      newQuantity: Math.max(0, previousQuantity + delta),
      note: delta > 0 ? 'Ajout de stock défectueux' : 'Sortie de stock défectueux'
    });
  };
  const updateInventory = (id: string, patch: Partial<Inventory>) => {
    setInventory(prev => prev.map(inv => (inv.id === id ? { ...inv, ...patch } : inv)));
  };

  const clearAllInventory = () => {
    // 1. Reset empty bottles stock quantities to 0
    setEmptyBottlesStock(prev => prev.map(s => ({ ...s, quantity: 0, lastUpdated: new Date().toISOString() })));
    
    // 2. Clear defective stock entries
    setDefectiveStock([]);
    
    // 3. Reset bottle types (full stock quantities)
    // We want to keep the standard types mentioned by the user
    const standardTypes = [
      { name: 'Butane 12KG', capacity: '12KG' },
      { name: 'Butane 6KG', capacity: '6KG' },
      { name: 'Butane 3KG', capacity: '3KG' },
      { name: 'BNG 12KG', capacity: '12KG' },
      { name: 'Propane 34KG', capacity: '34KG' },
      { name: 'Détendeur Clic-On', capacity: 'Standard' }
    ];

    setBottleTypes(prev => {
      // Keep existing but reset quantities
      const resetExisting = prev.map(bt => ({
        ...bt,
        distributedQuantity: 0,
        remainingQuantity: bt.totalQuantity,
        lastUpdated: new Date().toISOString()
      }));

      // Ensure standard types exist
      const next = [...resetExisting];
      standardTypes.forEach(st => {
        const exists = next.find(bt => bt.name.toLowerCase() === st.name.toLowerCase());
        if (!exists) {
          next.push({
            id: window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
            name: st.name,
            capacity: st.capacity,
            totalQuantity: 0,
            distributedQuantity: 0,
            remainingQuantity: 0,
            unitPrice: 0,
            taxRate: 20
          });
        }
      });
      return next;
    });

    // 4. Clear foreign bottles stock
    setForeignBottles([]);

    // 5. Add a history entry
    addStockHistory({
      date: new Date().toISOString(),
      bottleTypeId: 'all',
      bottleTypeName: 'Tout le Stock',
      stockType: 'all',
      changeType: 'remove',
      quantity: 0,
      previousQuantity: 0,
      newQuantity: 0,
      note: 'Réinitialisation complète de l\'inventaire (Types standards conservés)'
    });
  };

  const addFuelPurchase = (purchase: FuelPurchase) => {
    const id = purchase.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setFuelPurchases(prev => [...prev, { ...purchase, id }]);
  };
  const addFuelConsumption = (consumption: FuelConsumption) => {
    const id = consumption.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setFuelConsumptions(prev => [...prev, { ...consumption, id }]);
  };
  const addFuelDrain = (drain: FuelDrain) => {
    const id = drain.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setFuelDrains(prev => [...prev, { ...drain, id }]);
  };
  const addOilPurchase = (purchase: OilPurchase) => {
    const id = purchase.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setOilPurchases(prev => [...prev, { ...purchase, id }]);
  };
  const addOilConsumption = (consumption: OilConsumption) => {
    const id = consumption.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setOilConsumptions(prev => [...prev, { ...consumption, id }]);
  };
  const addOilDrain = (drain: OilDrain) => {
    const id = drain.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setOilDrains(prev => [...prev, { ...drain, id }]);
  };
  const updateCashOperation = (id: string | number, patch: Partial<CashOperation>) => {
    setCashOperations(prev => prev.map(op => (op.id === id ? { ...op, ...patch } : op)));
    
    // Also update financial transaction
    setFinancialTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        const type = patch.type || (tx.amount >= 0 ? 'versement' : 'retrait');
        return {
          ...tx,
          date: patch.date || tx.date,
          description: patch.name || tx.description,
          amount: patch.amount !== undefined ? (type === 'versement' ? patch.amount : -patch.amount) : tx.amount,
          sourceAccount: type === 'versement' ? 'autre' : (patch.accountAffected || tx.sourceAccount),
          destinationAccount: type === 'versement' ? (patch.accountAffected || tx.destinationAccount) : 'autre',
          accountDetails: patch.accountDetails !== undefined ? patch.accountDetails : tx.accountDetails,
        };
      }
      return tx;
    }));
  };
  const validateCashOperation = (id: string | number, validatorName?: string) => {
    setCashOperations(prev =>
      prev.map(op =>
        op.id === id
          ? { ...op, status: 'validated', validatedAt: new Date().toISOString(), validatedBy: validatorName }
          : op
      )
    );
    
    // Update financial transaction status
    setFinancialTransactions(prev => prev.map(tx => 
      tx.id === id ? { ...tx, status: 'completed' } : tx
    ));
  };
  const deleteCashOperation = (id: string | number) => {
    setCashOperations(prev => prev.filter(op => op.id !== id));
  };
  
  // Financial transactions
  const addFinancialTransaction = (tx: Omit<FinancialTransaction, 'id'> & { id?: string }) => {
    const newTx = { ...tx, id: tx.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) };
    setFinancialTransactions(prev => [...prev, newTx]);
  };

  const deleteFinancialTransaction = (id: string) => {
    setFinancialTransactions(prev => prev.filter(tx => tx.id !== id));
    // Also try to delete from other collections if the ID matches
    setCashOperations(prev => prev.filter(op => op.id !== id));
    setBankTransfers(prev => prev.filter(bt => bt.id !== id));
    setExpenses(prev => prev.filter(e => e.id !== id));
    setRepairs(prev => prev.filter(r => r.id !== id));
  };
  
  // Record revenue and linked financial transactions
  const addRevenue = (rev: Revenue) => {
    const id = rev.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    setRevenues(prev => [...prev, { ...rev, id }]);
    
    // Only add to financial transactions if it's not already handled by addCashOperation
    // This usually happens in Direct Sales (Vente Directe)
    if (!rev.relatedOrderId) {
      if (rev.cashAmount && rev.cashAmount > 0) {
        addFinancialTransaction({
          date: rev.date,
          type: 'versement',
          description: rev.description || 'Vente Directe (Espèce)',
          amount: rev.cashAmount,
          destinationAccount: 'espece',
          sourceAccount: 'autre',
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      }
      if (rev.checkAmount && rev.checkAmount > 0) {
        addFinancialTransaction({
          date: rev.date,
          type: 'versement',
          description: rev.description || 'Vente Directe (Chèque)',
          amount: rev.checkAmount,
          destinationAccount: 'cheque',
          sourceAccount: 'autre',
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      }
      if (rev.mygazAmount && rev.mygazAmount > 0) {
        addFinancialTransaction({
          date: rev.date,
          type: 'versement',
          description: rev.description || 'Vente Directe (MyGaz)',
          amount: rev.mygazAmount,
          destinationAccount: 'autre',
          sourceAccount: 'autre',
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      }
    }
  };
  
  // Bank transfers helpers
  const addBankTransfer = (bt: BankTransfer) => {
    const id = bt.id ?? (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    const newBt = { ...bt, id };
    setBankTransfers(prev => [...prev, newBt]);

    addFinancialTransaction({
      id,
      date: newBt.date,
      type: 'transfert',
      description: newBt.description || (newBt.type === 'remise_cheques' ? 'Remise de chèques' : 'Transfert bancaire'),
      amount: newBt.amount,
      sourceAccount: newBt.sourceAccount,
      destinationAccount: newBt.destinationAccount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  };

  const updateBankTransfer = (id: string, patch: Partial<BankTransfer>) => {
    setBankTransfers(prev => prev.map(bt => (bt.id === id ? { ...bt, ...patch } : bt)));
    
    // Also update financial transaction
    setFinancialTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        return {
          ...tx,
          date: patch.date || tx.date,
          amount: patch.amount || tx.amount,
          description: patch.description || tx.description,
          sourceAccount: patch.sourceAccount || tx.sourceAccount,
          destinationAccount: patch.destinationAccount || tx.destinationAccount,
        };
      }
      return tx;
    }));
  };

  const validateBankTransfer = (id: string, validatorName?: string) => {
    setBankTransfers(prev =>
      prev.map(bt =>
        bt.id === id
          ? { ...bt, status: 'validated', validatedAt: new Date().toISOString(), validatedBy: validatorName }
          : bt
      )
    );

    // Update financial transaction status
    setFinancialTransactions(prev => prev.map(tx => 
      tx.id === id ? { ...tx, status: 'completed' } : tx
    ));
  };
  const deleteBankTransfer = (id: string) => {
    setBankTransfers(prev => prev.filter(t => t.id !== id));
  };
  

  const getAccountBalance = (account: 'espece' | 'cheque' | 'banque' | 'autre') => {
    // Inclure à la fois les opérations validées et en attente pour refléter le solde actuel
    const relevantOps = cashOperations.filter((op) => 
      op.accountAffected === account && (op.status === 'validated' || op.status === 'pending')
    );
    const cashSum = relevantOps.reduce((sum, op) => sum + (op.type === 'versement' ? op.amount : -op.amount), 0);
    
    const relevantTransfers = bankTransfers.filter((t) => 
      (t.status === 'validated' || t.status === 'pending')
    );
    const transferSum = relevantTransfers.reduce((sum, t) => {
      let s = sum;
      if (t.sourceAccount === account) s -= t.amount;
      if (t.destinationAccount === account) s += t.amount;
      return s;
    }, 0);
    return cashSum + transferSum;
  };
  
  // Misc updates
  const updateBottleType = (id: string, patch: Partial<BottleType>) => {
    setBottleTypes(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)));
  };
  const addTransaction = (transaction: any) => {
    setTransactions(prev => [...prev, { ...transaction, id: window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) }]);
  };
  const updateDriver = (driverId: string, updates: Partial<Driver>) => {
    setDrivers(prev =>
      prev.map(d => {
        if (String(d.id) === String(driverId)) {
          const newDebt = updates.debt !== undefined ? (d.debt || 0) + updates.debt : d.debt;
          const newBalance = updates.balance !== undefined ? (d.balance || 0) + updates.balance : d.balance;
          const newAdvances = updates.advances !== undefined ? (d.advances || 0) + updates.advances : d.advances;
          
          // Merge or override remaining bottles
          let newRemainingBottles = { ...(d.remainingBottles || {}) };
          let nextRcHistory = d.rcHistory || [];
          let nextLastRCUpdate = d.lastRCUpdate;
          if (updates.remainingBottles) {
            if ((updates.remainingBottles as any)._isOverride) {
              const { _isOverride, ...actualBottles } = updates.remainingBottles as any;
              const prevBottles = d.remainingBottles || {};
              const keys = Array.from(new Set([...Object.keys(prevBottles), ...Object.keys(actualBottles)]));
              const changes = keys.reduce<Array<{ bottleTypeId: string; bottleTypeName?: string; previousQty: number; newQty: number; diff: number }>>((arr, id) => {
                const previousQty = prevBottles[id] || 0;
                const newQty = (actualBottles as any)[id] || 0;
                if (previousQty !== newQty) {
                  const name = bottleTypes.find(b => String(b.id) === String(id))?.name;
                  arr.push({
                    bottleTypeId: id,
                    bottleTypeName: name,
                    previousQty,
                    newQty,
                    diff: newQty - previousQty,
                  });
                }
                return arr;
              }, []);
              if (changes.length > 0) {
                const historyDate = updates.lastRCUpdate || new Date().toISOString();
                nextRcHistory = [...nextRcHistory, { date: historyDate, changes }];
                nextLastRCUpdate = historyDate;
              }
              newRemainingBottles = actualBottles;
            } else {
              Object.entries(updates.remainingBottles as Record<string, number>).forEach(([id, qty]) => {
                newRemainingBottles[id] = (newRemainingBottles[id] || 0) + (qty || 0);
              });
            }
          }

          return { 
            ...d, 
            ...updates, 
            debt: newDebt, 
            balance: newBalance, 
            advances: newAdvances,
            remainingBottles: newRemainingBottles,
            rcHistory: nextRcHistory,
            lastRCUpdate: nextLastRCUpdate
          };
        }
        return d;
      })
    );
  };
  const addForeignBottle = (foreignBottle: ForeignBottle) => {
    setForeignBottles(prev => [...prev, { ...foreignBottle, id: foreignBottle.id || (window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) }]);
  };

  // Truck management
  const updateTruck = (id: string, patch: Partial<Truck>) => {
    setTrucks(prev => {
      const current = prev.find(t => t.id === id);
      const nextDriverId = patch.driverId !== undefined ? patch.driverId : current?.driverId;

      if (current && nextDriverId !== undefined && nextDriverId !== current.driverId) {
        setTruckAssignments(assigns => [
          ...assigns,
          {
            id: window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
            truckId: id,
            prevDriverId: current.driverId || "",
            driverId: nextDriverId || "",
            date: new Date().toISOString(),
            note: patch.isActive === false ? "Mise en repos auto" : undefined,
          },
        ]);
      }

      return prev.map(t =>
        t.id === id
          ? { ...t, ...patch, updatedAt: new Date().toISOString() }
          : t
      );
    });
  };
  const bulkSetRepos = (ids: string[], reposReason?: string, nextReturnDate?: string) => {
    setTrucks(prev =>
      prev.map(t =>
        ids.includes(t.id)
          ? { ...t, isActive: false, reposReason, nextReturnDate, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };
  const bulkReactivate = (ids: string[]) => {
    setTrucks(prev =>
      prev.map(t =>
        ids.includes(t.id)
          ? { ...t, isActive: true, reposReason: undefined, nextReturnDate: undefined, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };
  const bulkDissociateDriver = (ids: string[]) => {
    setTruckAssignments(assigns => [
      ...assigns,
      ...ids.map(id => ({
        id: window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        truckId: id,
        prevDriverId: trucks.find(t => t.id === id)?.driverId || "",
        driverId: "",
        date: new Date().toISOString(),
        note: "Dissocié",
      })),
    ]);
    setTrucks(prev => prev.map(t => (ids.includes(t.id) ? { ...t, driverId: undefined, updatedAt: new Date().toISOString() } : t)));
  };
  const driverHasActiveTruck = (driverId: string) => trucks.find(t => t.driverId === driverId && t.isActive);

  const driversWithTransactions = React.useMemo(() => {
    return drivers.map(driver => ({
      ...driver,
      transactions: transactions.filter(t => String(t.driverId) === String(driver.id))
    }));
  });
  
  const value = {
    clients,
    addClient,
    brands,
    addBrand,
    drivers: driversWithTransactions,
    addDriver,
    updateDriver,
    updateDriverDebt,
    recordDriverPayment,
    updateBrand,
    deleteBrand,
    trucks,
    addTruck,
    updateTruck,
    bulkSetRepos,
    bulkReactivate,
    bulkDissociateDriver,
    driverHasActiveTruck,
    truckAssignments,
    supplies,
    addSupply,
    supplyReturns,
    addSupplyReturn,
    supplyOrders,
    addSupplyOrder,
    updateSupplyOrder,
    deleteSupplyOrder,
    returnOrders,
    addReturnOrder,
    deleteReturnOrder,
    cashOperations,
    addCashOperation,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    repairs,
    addRepair,
    updateRepair,
    deleteRepair,
    exchanges,
    addExchange,
    emptyBottlesStock,
    addEmptyStock,
    updateEmptyBottlesStock,
    updateEmptyBottlesStockByBottleType,
    defectiveStock,
    defectiveBottles: defectiveStock,
    addDefectiveStock,
    addDefectiveBottle,
    updateDefectiveBottlesStock,
    inventory,
    updateInventory,
    clearAllInventory,
    fuelPurchases,
    addFuelPurchase,
    fuelConsumptions,
    addFuelConsumption,
    fuelDrains,
    addFuelDrain,
    oilPurchases,
    addOilPurchase,
    oilConsumptions,
    addOilConsumption,
    oilDrains,
    addOilDrain,
    revenues,
    addRevenue,
    bankTransfers,
    addBankTransfer,
    updateBankTransfer,
    validateBankTransfer,
    deleteBankTransfer,
    financialTransactions,
    addFinancialTransaction,
    deleteFinancialTransaction,
    updateCashOperation,
    validateCashOperation,
    deleteCashOperation,
    getAccountBalance,
    bottleTypes,
    updateBottleType,
    transactions,
    addTransaction,
    foreignBottles,
    addForeignBottle,
    stockHistory,
    addStockHistory,
    suppliers: suppliers.map(s => ({
      ...s,
      transactionCount: transactions.filter(t => t.type === 'factory' && t.supplierId === s.id).length
    })),
    addSupplier,
    updateSupplier,
    deleteSupplier,
    expenseTypes,
    addExpenseType,
    exportData: () => {
      const data = {
        clients,
        brands,
        drivers,
        trucks,
        truckAssignments,
        supplies,
        supplyReturns,
        supplyOrders,
        returnOrders,
        cashOperations,
        expenses,
        repairs,
        exchanges,
        emptyBottlesStock,
        defectiveStock,
        bottleTypes,
        transactions,
        foreignBottles,
        inventory,
        fuelPurchases,
        fuelConsumptions,
        fuelDrains,
        oilPurchases,
        oilConsumptions,
        oilDrains,
        revenues,
        bankTransfers,
        financialTransactions,
        stockHistory,
        suppliers,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_gaz_maroc_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    importData: (jsonData: string) => {
      try {
        const data = JSON.parse(jsonData);
        
        if (data.clients) setClients(data.clients);
        if (data.brands) setBrands(data.brands);
        if (data.drivers) setDrivers(data.drivers);
        if (data.trucks) setTrucks(data.trucks);
        if (data.truckAssignments) setTruckAssignments(data.truckAssignments);
        if (data.supplies) setSupplies(data.supplies);
        if (data.supplyReturns) setSupplyReturns(data.supplyReturns);
        if (data.supplyOrders) setSupplyOrders(data.supplyOrders);
        if (data.returnOrders) setReturnOrders(data.returnOrders);
        if (data.cashOperations) setCashOperations(data.cashOperations);
        if (data.expenses) setExpenses(data.expenses);
        if (data.repairs) setRepairs(data.repairs);
        if (data.exchanges) setExchanges(data.exchanges);
        if (data.emptyBottlesStock) setEmptyBottlesStock(data.emptyBottlesStock);
        if (data.defectiveStock) setDefectiveStock(data.defectiveStock);
        if (data.bottleTypes) setBottleTypes(data.bottleTypes);
        if (data.transactions) setTransactions(data.transactions);
        if (data.foreignBottles) setForeignBottles(data.foreignBottles);
        if (data.inventory) setInventory(data.inventory);
        if (data.fuelPurchases) setFuelPurchases(data.fuelPurchases);
        if (data.fuelConsumptions) setFuelConsumptions(data.fuelConsumptions);
        if (data.fuelDrains) setFuelDrains(data.fuelDrains);
        if (data.oilPurchases) setOilPurchases(data.oilPurchases);
        if (data.oilConsumptions) setOilConsumptions(data.oilConsumptions);
        if (data.oilDrains) setOilDrains(data.oilDrains);
        if (data.revenues) setRevenues(data.revenues);
        if (data.bankTransfers) setBankTransfers(data.bankTransfers);
        if (data.financialTransactions) setFinancialTransactions(data.financialTransactions);
        if (data.stockHistory) setStockHistory(data.stockHistory);
        if (data.suppliers) setSuppliers(data.suppliers);

        alert("Données importées avec succès !");
        window.location.reload();
      } catch (error) {
        console.error("Error importing data:", error);
        alert("Erreur lors de l'importation des données. Veuillez vérifier le fichier.");
      }
    },
    clearAllData: () => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer TOUTES les données ? Cette action est irréversible.")) {
        localStorage.clear();
        window.location.reload();
      }
    },
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
  };
  
  export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
      throw new Error("useApp must be used within an AppProvider");
    }
    return context;
  }
