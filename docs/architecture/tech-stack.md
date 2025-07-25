# Technology Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|:---------|:-----------|:--------|:--------|:----------|
| **Windows App Language** | C# | 12.0 | Native Windows application development | Excellent Windows integration, Steam SDK support, plugin hosting |
| **Windows App Framework** | WinUI 3 | 1.4.x | Modern Windows UI framework | Native performance, modern UI capabilities, touch support |
| **Game Integration** | SteamCMD | Latest | Steam game server management | Official Steam server deployment and update system |
| **Plugin Runtime** | .NET 8 | 8.0.x | Plugin execution environment | Secure sandboxing, performance, cross-plugin compatibility |
| **Local Database** | SQLite | 3.45.x | Local data storage | Embedded, reliable, no external dependencies |
| **Cloud Platform** | Azure | Latest | Cloud services hosting | Enterprise-grade, global scale, integrated services |
| **Backend Language** | C# | 12.0 | Cloud services development | Code sharing with Windows app, strong typing |
| **Backend Framework** | ASP.NET Core | 8.0.x | Web API and services | High performance, cloud-native, excellent tooling |
| **API Style** | REST + SignalR | 8.0.x | API communication and real-time sync | Standard REST for CRUD, SignalR for real-time updates |
| **Cloud Database** | PostgreSQL | 15.x | Community and marketplace data | ACID compliance, JSON support, Azure integration |
| **Cache** | Redis | 7.x | Session and performance caching | High-performance caching, pub/sub for real-time features |
| **Frontend Language** | TypeScript | 5.3.x | Type-safe web dashboard development | Strong typing, excellent tooling, code sharing |
| **Frontend Framework** | React | 18.x | Web dashboard UI framework | Component-based, excellent ecosystem, team expertise |
| **UI Component Library** | Tailwind CSS | 3.4.x | Responsive design system | Utility-first, customizable, rapid development |
| **State Management** | Zustand | 4.x | Global state management | Simple, performant, TypeScript-friendly |
| **Real-time Client** | SignalR Client | 8.0.x | Web dashboard real-time updates | Native integration with backend SignalR |
| **Authentication** | Azure AD B2C | Latest | User authentication and authorization | Enterprise security, social login, scalable |
| **File Storage** | Azure Blob Storage | Latest | Plugin files, game assets, backups | Scalable, CDN integration, cost-effective |
| **Build Tool** | .NET CLI + Vite | Latest | Build automation | Native .NET tooling, fast frontend builds |
| **Containerization** | Docker | Latest | Plugin sandboxing and cloud deployment | Security isolation, scalable deployment |
| **CI/CD** | Azure DevOps | Latest | Automated testing and deployment | Integrated with Azure, Windows app packaging |
| **Monitoring** | Application Insights | Latest | Performance and error tracking | Deep Azure integration, real-time monitoring |
| **Logging** | Serilog | 3.x | Structured logging | Flexible, performant, cloud-compatible |