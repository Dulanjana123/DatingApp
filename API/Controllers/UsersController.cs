using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        //Inside this class we has access to our database using _context
        private readonly IUserRepository _userRepository;
        public readonly IMapper _mapper;
        public UsersController(IUserRepository userRepository, IMapper mapper)
        {
            _mapper = mapper;
            _userRepository = userRepository;
        }

        //get all users
        [HttpGet]
        public async Task <ActionResult<IEnumerable<MemberDto>>> GetUsers()
        {
            var users = await _userRepository.GetMembersAsync();

            return Ok(users);
            // var usersToReturn = _mapper.Map<IEnumerable<MemberDto>>(users);
            
            // return Ok(usersToReturn);
        }
             
        //get a user
        //api/users/3
        
        [HttpGet("{username}")]
        public async Task <ActionResult<MemberDto>> GetUser(string username)
        {
            return await _userRepository.GetMemberAsync(username); //get entity from memmory from this request

            //return _mapper.Map<MemberDto>(user); // in memmory we map one object to another
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            var username =  User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userRepository.GetUserByUsernameAsync(username);

            if(user == null) return NotFound();

            _mapper.Map(memberUpdateDto, user);

            if(await _userRepository.SaveAllAsync()) return NoContent();
            return  BadRequest("Failed to update user");
        }


    }
}