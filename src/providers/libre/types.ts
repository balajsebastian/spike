export interface LibreLoginResponse {
  /** 2 means the email or password was rejected. */
  status?: number;
  data?: {
    redirect?: boolean;
    region?: string;
    authTicket?: { token: string };
    user?: { id: string | number };
  };
}

export interface LibreGraphPoint {
  ValueInMgPerDl: number;
  FactoryTimestamp?: string;
  Timestamp: string;
}

export interface LibreGraphResponse {
  data?: {
    connection?: { glucoseMeasurement?: LibreGraphPoint & { TrendArrow: number } };
    graphData?: LibreGraphPoint[];
  };
}

export interface LibreConnectionResponse {
  data?: {
    patientId?: string;
    glucoseMeasurement?: {
      ValueInMgPerDl: number;
      TrendArrow: number;
      FactoryTimestamp?: string;
      Timestamp: string;
    };
  }[];
}
