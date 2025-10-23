import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, MapPin, Building } from 'lucide-react';
import SuppliersList from './SuppliersList';
import LocalDealersMap from './LocalDealersMap';

const SuppliersMap: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Truck className="h-8 w-8 text-accent-orange" />
          <h1 className="text-3xl font-bold text-foreground">Suppliers & Materials</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Connect with trusted suppliers and find local dealers for your craft business
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="directory" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Suppliers Directory
          </TabsTrigger>
          <TabsTrigger value="local-dealers" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Local Dealers Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-0">
          <SuppliersList />
        </TabsContent>

        <TabsContent value="local-dealers" className="mt-0">
          <LocalDealersMap />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuppliersMap;