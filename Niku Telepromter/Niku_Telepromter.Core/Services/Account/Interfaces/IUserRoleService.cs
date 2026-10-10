// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

using Niku_Telepromter.Core.Models.Account;

namespace Niku_Telepromter.Core.Services.Account
{
    public interface IUserRoleService
    {
        Task<(bool Succeeded, string[] Errors)> CreateRoleAsync(ApplicationRole role, IEnumerable<string> claims);
        Task<(bool Succeeded, string[] Errors)> DeleteRoleAsync(ApplicationRole role);
        Task<(bool Succeeded, string[] Errors)> DeleteRoleAsync(string roleName);
        Task<ApplicationRole?> GetRoleByIdAsync(string roleId);
        Task<ApplicationRole?> GetRoleByNameAsync(string roleName);
        Task<ApplicationRole?> GetRoleLoadRelatedAsync(string roleName);
        Task<List<ApplicationRole>> GetRolesLoadRelatedAsync(int page, int pageSize);
        Task<(bool Success, string[] Errors)> TestCanDeleteRoleAsync(string roleId);
        Task<(bool Succeeded, string[] Errors)> UpdateRoleAsync(ApplicationRole role, IEnumerable<string>? claims);
    }
}
