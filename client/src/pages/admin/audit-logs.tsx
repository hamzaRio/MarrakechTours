import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AuditLogTable from "@/components/admin/audit-log";
import { Helmet } from "react-helmet";

export default function AdminAuditLogs() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Audit Logs | Admin - MarrakechDeserts</title>
      </Helmet>
      
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Audit Logs</h1>
        <AuditLogTable />
      </div>
    </>
  );
}