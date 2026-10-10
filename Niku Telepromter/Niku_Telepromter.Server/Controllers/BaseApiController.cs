// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Niku_Telepromter.Core.Services.Account;
using Niku_Telepromter.Server.Attributes;
using Niku_Telepromter.Server.Services;

namespace Niku_Telepromter.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [SanitizeModel]
    public class BaseApiController : ControllerBase
    {
        protected readonly IMapper _mapper;
        protected readonly ILogger<BaseApiController> _logger;

        public BaseApiController(ILogger<BaseApiController> logger, IMapper mapper)
        {
            _logger = logger;
            _mapper = mapper;
        }

        protected string GetCurrentUserId(string errorMsg = "Error retrieving the userId for the current user.")
        {
            return Utilities.GetUserId(User) ?? throw new UserNotFoundException(errorMsg);
        }

        protected void AddModelError(IEnumerable<string> errors, string key = "")
        {
            foreach (var error in errors)
            {
                AddModelError(error, key);
            }
        }

        protected void AddModelError(string error, string key = "")
        {
            ModelState.AddModelError(key, error);
        }
    }
}
