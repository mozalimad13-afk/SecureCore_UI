export interface User {
    id?: number;
    email: string;
    name: string;
    role: 'user' | 'admin';
    is_active?: boolean;
    last_login?: string;
    created_at?: string;
    country?: string;
    alerts_count?: number;
    subscription?: {
        plan: string;
        status: string;
        expires_at: string | null;
    } | null;
    payment_info?: {
        card_brand: string;
        card_last4: string;
        expiry: string;
        billing_address?: string;
    } | null;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'alert' | 'info' | 'warning';
    link?: string;
}

export interface Pagination {
    page: number;
    per_page: number;
    total: number;
    pages: number;
}

export interface Alert {
    id: number;
    ip?: string;
    source_ip?: string;
    type?: string;
    attack_type?: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    time?: string;
    timestamp?: string;
    created_at?: string;
    confidence: number;
    status: 'active' | 'acknowledged' | 'resolved';
}
export interface AdminBroadcast {
    id: number;
    title: string;
    message: string;
    target: string;
    recipient_count: number;
    sent_at: string;
    status: string;
}

export interface BlocklistIP {
    id: number;
    ip: string;
    reason: string;
    timestamp: string;
}

export interface WhitelistIP {
    id: number;
    ip: string;
    description: string;
    timestamp: string;
}

export interface APIToken {
    id: number;
    name: string;
    token?: string;
    last_used?: string;
    created_at: string;
}

export interface SystemHealth {
    overall_status: 'healthy' | 'degraded' | 'critical' | 'error';
    timestamp: string;
    server?: {
        status: string;
        cpu: { usage_percent: number; cores: number };
        memory: { usage_percent: number; used_gb: number; total_gb: number };
        disk: { usage_percent: number; used_gb: number; total_gb: number };
    };
    api?: { status: string };
    database?: { status: string; total_records: number; table_counts: Record<string, number> };
    application?: { status: string };
}

export interface AdminStats {
    total_companies: number;
    total_alerts: number;
    active_subscriptions: number;
    system_load: number;
    company_growth: { month: string; companies: number }[];
    revenue_trend: { month: string; revenue: number }[];
}

export interface Subscription {
    id: number;
    plan_name: string;
    plan_price: number;
    status: 'active' | 'expired' | 'trial';
    next_billing_date: string | null;
    max_requests_per_minute: number;
    max_requests_per_month: number;
}

export interface PaymentMethod {
    id: number;
    card_brand: string;
    card_last4: string;
    expiry_month: string;
    expiry_year: string;
    is_default: boolean;
}

export interface ReportPreview {
    alert_count: number;
    blocked_ip_count: number;
    whitelisted_ip_count: number;
    total_records: number;
    start_date: string;
    end_date: string;
}

export interface PaymentMethodForm {
    cardNumber: string;
    cardName: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    billingAddress?: string;
    city?: string;
    zipCode?: string;
}

export interface AlertStats {
    total_today: number;
    blocked_threats: number;
    severity_distribution: Record<string, number>;
    weekly_trend: { date: string; alerts: number; blocked: number }[];
    system_status?: 'healthy' | 'degraded' | 'critical' | 'error' | 'unknown' | string;
}

export interface AlertQueryParams {
    page?: number;
    per_page?: number;
    severity?: string;
    attack_type?: string;
    acknowledged?: boolean;
}
