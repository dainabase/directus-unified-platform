import frappe
from frappe import _

def setup_companies():
    """Configurer les 5 entreprises dans ERPNext"""
    
    companies = [
        {
            "company_name": "HyperVisual",
            "abbr": "HV",
            "country": "Switzerland",
            "default_currency": "CHF",
            "domain": "Manufacturing",
            "chart_of_accounts": "Switzerland - Chart of Accounts"
        },
        {
            "company_name": "Dynamics",
            "abbr": "DYN",
            "country": "Switzerland", 
            "default_currency": "CHF",
            "domain": "Services",
            "chart_of_accounts": "Switzerland - Chart of Accounts"
        },
        {
            "company_name": "Lexia",
            "abbr": "LEX",
            "country": "Switzerland",
            "default_currency": "CHF",
            "domain": "Services",
            "chart_of_accounts": "Switzerland - Chart of Accounts"
        },
        {
            "company_name": "NKReality",
            "abbr": "NKR",
            "country": "Switzerland",
            "default_currency": "CHF",
            "domain": "Services",
            "chart_of_accounts": "Switzerland - Chart of Accounts"
        },
        {
            "company_name": "Etekout",
            "abbr": "ETK",
            "country": "Switzerland",
            "default_currency": "CHF",
            "domain": "Retail",
            "chart_of_accounts": "Switzerland - Chart of Accounts"
        }
    ]
    
    for company_data in companies:
        if not frappe.db.exists("Company", company_data["company_name"]):
            company = frappe.get_doc({
                "doctype": "Company",
                **company_data
            })
            company.insert()
            print(f"✅ Entreprise créée: {company_data['company_name']}")
        else:
            print(f"⚠️ Entreprise existe déjà: {company_data['company_name']}")
    
    frappe.db.commit()

# Exécuter dans le container
# docker exec -it erpnext_backend_1 bench execute setup_companies.setup_companies