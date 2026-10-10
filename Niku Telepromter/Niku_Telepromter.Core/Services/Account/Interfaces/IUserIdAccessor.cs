// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

namespace Niku_Telepromter.Core.Services.Account
{
    public interface IUserIdAccessor
    {
        string? GetCurrentUserId();
    }
}
