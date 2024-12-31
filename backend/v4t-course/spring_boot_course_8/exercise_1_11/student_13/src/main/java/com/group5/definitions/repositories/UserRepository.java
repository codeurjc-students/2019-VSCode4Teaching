package com.group5.definitions.repositories;

import org.springframework.data.repository.CrudRepository;

import com.group5.definitions.model.*;

public interface UserRepository extends CrudRepository<User, Long> {

	User findByName(String name);

}
