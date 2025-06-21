import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Building2, Users, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CrmStatusProps {
  className?: string;
}

interface CrmStatusData {
  connected: boolean;
  provider?: 'hubspot' | 'zoho' | null;
  apiKey?: string;
  lastSync?: string;
  totalContacts?: number;
  error?: string;
}

export default function CrmStatus({ className }: CrmStatusProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [crmStatus, setCrmStatus] = useState<CrmStatusData>({
    connected: false
  });
  const { toast } = useToast();

  // Fetch CRM status from the server
  const fetchCrmStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/crm/status');
      
      if (response.ok) {
        const data = await response.json();
        setCrmStatus(data);
      } else {
        setCrmStatus({
          connected: false,
          error: 'Failed to fetch CRM status'
        });
      }
    } catch (error) {
      console.error('Error fetching CRM status:', error);
      setCrmStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh CRM status
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCrmStatus();
    setIsRefreshing(false);
    
    toast({
      title: 'CRM Status Refreshed',
      description: 'The CRM connection status has been updated.',
    });
  };

  // Test CRM connection (simulated)
  const handleTestConnection = async () => {
    try {
      setIsRefreshing(true);
      
      const response = await fetch('/api/crm/test', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: result.success ? 'Connection Successful' : 'Connection Failed',
          description: result.message,
          variant: result.success ? 'default' : 'destructive'
        });
        
        // Refresh status
        await fetchCrmStatus();
      } else {
        toast({
          title: 'Connection Test Failed',
          description: 'Failed to test CRM connection',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error testing CRM connection:', error);
      toast({
        title: 'Connection Test Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch status on component mount
  useEffect(() => {
    fetchCrmStatus();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>CRM Integration</CardTitle>
          <CardDescription>Loading CRM status...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>CRM Integration</CardTitle>
          <CardDescription>
            Current status of the CRM integration
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={crmStatus.connected ? "outline" : "destructive"}
            className={`${crmStatus.connected ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}`}
          >
            {crmStatus.connected ? 'Connected' : 'Disconnected'}
          </Badge>
          {crmStatus.provider && (
            <Badge variant="outline" className="text-blue-800">
              {crmStatus.provider === 'hubspot' ? 'HubSpot' : 'Zoho CRM'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {crmStatus.error ? (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <p className="text-sm text-red-700 mt-1">{crmStatus.error}</p>
              </div>
            </div>
          </div>
        ) : null}

        {crmStatus.connected ? (
          <>
            <Table className="mb-4">
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Provider</TableCell>
                  <TableCell>{crmStatus.provider === 'hubspot' ? 'HubSpot' : 'Zoho CRM'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">API Key Status</TableCell>
                  <TableCell className="flex items-center">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
                    Valid and Active
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Last Sync</TableCell>
                  <TableCell>{crmStatus.lastSync || 'Never'}</TableCell>
                </TableRow>
                {crmStatus.totalContacts !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Total Contacts</TableCell>
                    <TableCell>{crmStatus.totalContacts}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">CRM Not Connected</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              To enable CRM integration, please add the necessary API keys to your environment variables. 
              Add HUBSPOT_API_KEY for HubSpot or ZOHO_ACCESS_TOKEN for Zoho CRM.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestConnection}
            disabled={isRefreshing}
          >
            <Users className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}