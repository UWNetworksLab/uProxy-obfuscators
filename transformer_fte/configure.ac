AC_INIT([transformer_fte],[0.0.1])

AC_SUBST(gmpdir)
AC_ARG_WITH(gmp, 
            AS_HELP_STRING([--with-gmp=DIR],
                           [Specify path to the GMP directory]),
            [gmpdir="$withval"],
            AC_MSG_FAILURE([You must specify the path to the GMP directory])
           )

AC_SUBST(libftedir)
AC_ARG_WITH(libfte, 
            AS_HELP_STRING([--with-libfte=DIR],
                           [Specify path to the libfte directory]),
            [libftedir="$withval"],
            AC_MSG_FAILURE([You must specify the path to the libfte directory])
           )

AC_PROG_CXX
AC_LANG([C++])

AC_CONFIG_FILES([Makefile])

AC_OUTPUT
