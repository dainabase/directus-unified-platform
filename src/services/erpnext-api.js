const axios = require('axios');

class ERPNextAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'http://localhost:8083';
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api`,
      headers: {
        'Authorization': `token ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // === MÉTHODES GÉNÉRIQUES ===
  async getList(doctype, filters = {}, fields = []) {
    const params = {
      doctype,
      filters: JSON.stringify(filters),
      fields: JSON.stringify(fields),
      limit_page_length: 1000
    };
    
    const response = await this.api.get('/resource/' + doctype, { params });
    return response.data.data;
  }

  async getDoc(doctype, name) {
    const response = await this.api.get(`/resource/${doctype}/${name}`);
    return response.data.data;
  }

  async createDoc(doctype, data) {
    const response = await this.api.post(`/resource/${doctype}`, data);
    return response.data.data;
  }

  async updateDoc(doctype, name, data) {
    const response = await this.api.put(`/resource/${doctype}/${name}`, data);
    return response.data.data;
  }

  async deleteDoc(doctype, name) {
    const response = await this.api.delete(`/resource/${doctype}/${name}`);
    return response.data;
  }

  // === CLIENTS ===
  async createCustomer(customer) {
    const data = {
      customer_name: customer.name,
      customer_type: customer.type || 'Company',
      customer_group: customer.group || 'Commercial',
      territory: customer.territory || 'Switzerland',
      company: customer.company,
      tax_id: customer.tax_id,
      default_currency: customer.currency || 'CHF',
      customer_primary_contact: customer.primary_contact,
      customer_primary_address: customer.primary_address
    };
    
    return await this.createDoc('Customer', data);
  }

  // === FOURNISSEURS ===
  async createSupplier(supplier) {
    const data = {
      supplier_name: supplier.name,
      supplier_group: supplier.group || 'Services',
      company: supplier.company,
      tax_id: supplier.tax_id,
      default_currency: supplier.currency || 'CHF',
      supplier_primary_contact: supplier.primary_contact,
      supplier_primary_address: supplier.primary_address
    };
    
    return await this.createDoc('Supplier', data);
  }

  // === ARTICLES ===
  async createItem(item) {
    const data = {
      item_code: item.code,
      item_name: item.name,
      item_group: item.group || 'Products',
      stock_uom: item.uom || 'Unit',
      is_stock_item: item.is_stock || 0,
      is_sales_item: 1,
      is_purchase_item: item.is_purchase || 0,
      description: item.description,
      default_warehouse: item.warehouse,
      standard_rate: item.rate || 0,
      company: item.company
    };
    
    return await this.createDoc('Item', data);
  }

  // === FACTURES ===
  async createSalesInvoice(invoice) {
    const data = {
      company: invoice.company,
      customer: invoice.customer,
      posting_date: invoice.date,
      due_date: invoice.due_date,
      currency: invoice.currency || 'CHF',
      items: invoice.items.map(item => ({
        item_code: item.code,
        qty: item.quantity,
        rate: item.rate,
        amount: item.amount,
        description: item.description
      })),
      taxes: invoice.taxes || [],
      payment_terms_template: invoice.payment_terms,
      remarks: invoice.remarks
    };
    
    return await this.createDoc('Sales Invoice', data);
  }

  // === STOCKS ===
  async getStockBalance(item_code, warehouse) {
    const response = await this.api.get('/method/erpnext.stock.utils.get_stock_balance', {
      params: {
        item_code,
        warehouse,
        posting_date: new Date().toISOString().split('T')[0]
      }
    });
    
    return response.data.message;
  }

  async createStockEntry(entry) {
    const data = {
      company: entry.company,
      stock_entry_type: entry.type, // 'Material Receipt', 'Material Issue', etc.
      posting_date: entry.date,
      items: entry.items.map(item => ({
        item_code: item.code,
        qty: item.quantity,
        s_warehouse: item.source_warehouse,
        t_warehouse: item.target_warehouse,
        basic_rate: item.rate || 0
      }))
    };
    
    return await this.createDoc('Stock Entry', data);
  }

  // === RH ===
  async createEmployee(employee) {
    const data = {
      employee_name: employee.name,
      company: employee.company,
      date_of_joining: employee.joining_date,
      date_of_birth: employee.birth_date,
      gender: employee.gender,
      department: employee.department,
      designation: employee.designation,
      reports_to: employee.reports_to,
      prefered_email: employee.email,
      cell_number: employee.phone
    };
    
    return await this.createDoc('Employee', data);
  }

  async createLeaveApplication(leave) {
    const data = {
      employee: leave.employee,
      leave_type: leave.type,
      from_date: leave.from_date,
      to_date: leave.to_date,
      description: leave.reason,
      leave_approver: leave.approver,
      company: leave.company
    };
    
    return await this.createDoc('Leave Application', data);
  }

  // === RAPPORTS ===
  async runReport(report_name, filters = {}) {
    const response = await this.api.get(`/method/frappe.desk.query_report.run`, {
      params: {
        report_name,
        filters: JSON.stringify(filters)
      }
    });
    
    return response.data.message;
  }

  // === KPIs POUR DASHBOARD ===
  async getKPIs(company = null) {
    const filters = company && company !== 'all' ? { company } : {};
    
    // Récupérer différentes métriques
    const [revenue, pendingInvoices, stock, employees] = await Promise.all([
      // CA du mois
      this.api.get('/method/frappe.desk.reportview.get', {
        params: {
          doctype: 'Sales Invoice',
          filters: JSON.stringify({
            ...filters,
            posting_date: ['>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]],
            docstatus: 1
          }),
          fields: JSON.stringify(['grand_total'])
        }
      }),
      
      // Factures en attente
      this.getList('Sales Invoice', {
        ...filters,
        status: 'Unpaid',
        docstatus: 1
      }, ['name']),
      
      // Stock total (simplification)
      this.api.get('/method/erpnext.stock.dashboard.warehouse_dashboard.get_data', {
        params: { filters: JSON.stringify(filters) }
      }),
      
      // Employés actifs
      this.getList('Employee', {
        ...filters,
        status: 'Active'
      }, ['name'])
    ]);
    
    // Calculer les totaux
    const totalRevenue = revenue.data.values?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0;
    
    return {
      revenue: totalRevenue,
      pending_invoices: pendingInvoices.length,
      total_stock: stock.data.message?.total_stock_value || 0,
      active_employees: employees.length
    };
  }

  // === GRAPHIQUES ===
  async getRevenueChart(company = null, months = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const filters = {
      posting_date: ['between', [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]],
      docstatus: 1
    };
    
    if (company && company !== 'all') {
      filters.company = company;
    }
    
    const response = await this.api.get('/method/frappe.desk.reportview.get', {
      params: {
        doctype: 'Sales Invoice',
        filters: JSON.stringify(filters),
        fields: JSON.stringify(['posting_date', 'grand_total']),
        order_by: 'posting_date asc'
      }
    });
    
    // Grouper par mois
    const monthlyData = {};
    response.data.values?.forEach(inv => {
      const month = inv.posting_date.substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + inv.grand_total;
    });
    
    return {
      labels: Object.keys(monthlyData),
      values: Object.values(monthlyData)
    };
  }

  async getCompanyBreakdown() {
    const companies = ['HyperVisual', 'Dynamics', 'Lexia', 'NKReality', 'Etekout'];
    const revenues = [];
    
    for (const company of companies) {
      const kpis = await this.getKPIs(company);
      revenues.push(kpis.revenue);
    }
    
    return {
      labels: companies,
      values: revenues
    };
  }
}

module.exports = ERPNextAPI;