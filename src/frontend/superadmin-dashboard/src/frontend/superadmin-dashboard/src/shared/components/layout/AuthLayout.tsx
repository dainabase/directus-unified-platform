import React from 'react'
import { Outlet } from 'react-router-dom'
import { Building2, Shield, Zap } from 'lucide-react'

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-md space-y-8">
            <div className="flex items-center space-x-3">
              <Building2 className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold text-gray-900">Directus Platform</h1>
            </div>
            
            <p className="text-xl text-gray-600">
              Unified business management platform for modern enterprises
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-primary/60" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Enterprise Security</h3>
                  <p className="text-sm text-gray-600">
                    Bank-grade encryption and role-based access control
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Zap className="h-8 w-8 text-primary/60" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Monitor your business performance in real-time
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-primary/60" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Multi-company Support</h3>
                  <p className="text-sm text-gray-600">
                    Manage multiple entities from a single dashboard
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Trusted by leading Swiss companies for their digital transformation
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Auth form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}