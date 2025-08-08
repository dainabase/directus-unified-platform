import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OWNER_COMPANIES, getCompanyOptions, formatCompanyName } from '../utils/company-filter';
import directus from '../services/api/directus';

export default function FilteringTest() {
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Collections à tester
  const testCollections = [
    'projects',
    'client_invoices',
    'expenses',
    'bank_transactions',
    'deliverables',
    'subscriptions',
    'budgets',
    'time_tracking',
    'support_tickets',
    'quotes',
    'proposals'
  ];

  const companyOptions = getCompanyOptions(true);

  /**
   * Lance les tests de filtrage pour toutes les collections
   */
  const runFilteringTests = async () => {
    setIsLoading(true);
    const results = {};

    console.log(`🧪 Testing company filtering for: ${selectedCompany}`);

    for (const collection of testCollections) {
      try {
        console.log(`Testing ${collection}...`);

        // Test avec le filtre sélectionné
        const filteredData = await directus.get(
          collection,
          { limit: -1 },
          { company: selectedCompany }
        );

        // Test sans filtre pour comparaison
        const allData = await directus.get(collection, { limit: -1 }, {});

        results[collection] = {
          success: true,
          filteredCount: filteredData.length,
          totalCount: allData.length,
          sampleData: filteredData.slice(0, 3),
          error: null
        };

        console.log(`✅ ${collection}: ${filteredData.length}/${allData.length} items`);

      } catch (error) {
        console.error(`❌ Error testing ${collection}:`, error.message);
        
        results[collection] = {
          success: false,
          filteredCount: 0,
          totalCount: 0,
          sampleData: [],
          error: error.message
        };
      }
    }

    setTestResults(results);
    setLastUpdate(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  /**
   * Teste une collection spécifique
   */
  const testSingleCollection = async (collection) => {
    try {
      const data = await directus.get(
        collection,
        { limit: 10 },
        { company: selectedCompany }
      );

      console.log(`📊 ${collection} sample:`, data);
      
      if (data.length > 0) {
        console.table(data.map(item => ({
          id: item.id,
          owner_company: item.owner_company,
          name: item.name || item.title || 'N/A',
          status: item.status || 'N/A'
        })));
      }
    } catch (error) {
      console.error(`❌ Error testing ${collection}:`, error.message);
    }
  };

  /**
   * Affiche les statistiques globales
   */
  const renderSummary = () => {
    if (Object.keys(testResults).length === 0) return null;

    const totalFiltered = Object.values(testResults).reduce((sum, result) => 
      sum + result.filteredCount, 0
    );

    const totalAll = Object.values(testResults).reduce((sum, result) => 
      sum + result.totalCount, 0
    );

    const successfulTests = Object.values(testResults).filter(result => 
      result.success
    ).length;

    const filterRatio = totalAll > 0 ? (totalFiltered / totalAll * 100).toFixed(1) : 0;

    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">
            🎯 Résumé des Tests - {formatCompanyName(selectedCompany)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{successfulTests}</div>
              <div className="text-sm text-gray-600">Collections OK</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalFiltered.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Items filtrés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{totalAll.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Items totaux</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{filterRatio}%</div>
              <div className="text-sm text-gray-600">Ratio filtré</div>
            </div>
          </div>
          
          {lastUpdate && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Dernière mise à jour: {lastUpdate}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  /**
   * Affiche les résultats pour une collection
   */
  const renderCollectionResult = (collection, result) => {
    const companyColor = selectedCompany !== 'all' ? 
      OWNER_COMPANIES[selectedCompany]?.color : '#666';

    return (
      <Card key={collection} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg capitalize">
              📊 {collection.replace('_', ' ')}
            </CardTitle>
            <div className="flex items-center gap-2">
              {result.success ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✅ OK
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  ❌ Erreur
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => testSingleCollection(collection)}
                className="h-6 px-2 text-xs"
              >
                Test
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {result.success ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-bold" style={{ color: companyColor }}>
                  {result.filteredCount.toLocaleString()}
                </div>
                <div className="text-right text-sm text-gray-600">
                  sur {result.totalCount.toLocaleString()} total
                  <div className="text-xs">
                    {result.totalCount > 0 ? 
                      ((result.filteredCount / result.totalCount) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>

              {result.sampleData.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Échantillon:</div>
                  <div className="space-y-1">
                    {result.sampleData.map((item, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                        <span className="font-medium">
                          {item.name || item.title || `#${item.id?.substring(0, 8)}`}
                        </span>
                        <span className="text-gray-500">
                          {item.owner_company}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-600 text-sm">
              ❌ {result.error}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Auto-refresh au changement de compagnie
  useEffect(() => {
    if (selectedCompany) {
      runFilteringTests();
    }
  }, [selectedCompany]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Tests de Filtrage Multi-Entreprises
        </h1>
        <p className="text-gray-600">
          Interface de test pour valider le bon fonctionnement du filtrage owner_company
        </p>
      </div>

      {/* Contrôles */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🎮 Contrôles de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Entreprise:</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sélectionner une entreprise" />
                </SelectTrigger>
                <SelectContent>
                  {companyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={runFilteringTests} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? '⏳ Test en cours...' : '🚀 Lancer les Tests'}
            </Button>

            <Button 
              variant="outline"
              onClick={() => console.log('Test Results:', testResults)}
            >
              📊 Log Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résumé */}
      {renderSummary()}

      {/* Résultats détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(testResults).map(([collection, result]) =>
          renderCollectionResult(collection, result)
        )}
      </div>

      {/* Instructions */}
      {Object.keys(testResults).length === 0 && (
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">📋 Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ol className="list-decimal list-inside space-y-2">
              <li>Sélectionnez une entreprise dans la liste déroulante</li>
              <li>Cliquez sur "Lancer les Tests" pour tester le filtrage</li>
              <li>Observez les résultats pour chaque collection</li>
              <li>Utilisez "Test" sur une collection spécifique pour voir les détails</li>
              <li>Vérifiez la console pour les logs détaillés</li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}