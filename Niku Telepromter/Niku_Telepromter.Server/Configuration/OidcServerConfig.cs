// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Niku_Telepromter.Server.Configuration
{
    public static class OidcServerConfig
    {
        public const string ServerName = "Niku Telepromter API";
        public const string QuickAppClientID = "quickapp_spa";
        public const string SwaggerClientID = "swagger_ui";

        public static async Task RegisterClientApplicationsAsync(IServiceProvider provider)
        {
            var manager = provider.GetRequiredService<IOpenIddictApplicationManager>();

            // Angular SPA Client
            if (await manager.FindByClientIdAsync(QuickAppClientID) is null)
            {
                await manager.CreateAsync(new OpenIddictApplicationDescriptor
                {
                    ClientId = QuickAppClientID,
                    ClientType = ClientTypes.Public,
                    DisplayName = "Niku Telepromter SPA",
                    Permissions =
                    {
                        Permissions.Endpoints.Token,
                        Permissions.GrantTypes.Password,
                        Permissions.GrantTypes.RefreshToken,
                        Permissions.Scopes.Profile,
                        Permissions.Scopes.Email,
                        Permissions.Scopes.Phone,
                        Permissions.Scopes.Address,
                        Permissions.Scopes.Roles
                    }
                });
            }

            // Swagger UI Client
            if (await manager.FindByClientIdAsync(SwaggerClientID) is null)
            {
                await manager.CreateAsync(new OpenIddictApplicationDescriptor
                {
                    ClientId = SwaggerClientID,
                    ClientType = ClientTypes.Public,
                    DisplayName = "Swagger UI",
                    Permissions =
                    {
                        Permissions.Endpoints.Token,
                        Permissions.GrantTypes.Password
                    }
                });
            }
        }
    }
}
